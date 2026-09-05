"use client";

import { useEffect, useRef } from "react";
import { Fuel, Gauge, Users } from "lucide-react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

export function Fleet() {
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const slug = (entry.target as HTMLElement).dataset.slug;
      if (entry.isIntersecting && slug && !seen.has(slug)) { seen.add(slug); track("fleet_card_view", { carSlug: slug }); }
    }), { threshold: .65 });
    gridRef.current?.querySelectorAll("[data-slug]").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  function chooseCar(slug: string) {
    window.dispatchEvent(new CustomEvent("jh:select-car", { detail: slug }));
    document.querySelector("#enquire")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="fleet-grid" ref={gridRef}>
      {site.fleet.map((car) => (
        <article className="car-card" data-slug={car.slug} key={car.slug}>
          <div className={`car-visual ${car.accent}`}>
            {"popular" in car && car.popular ? <span className="popular">Most requested</span> : null}
            <div className="road-lines" /><div className="car-silhouette" />
          </div>
          <div className="car-body">
            <div className="car-name-row"><div><h3 className="car-name">{car.name}</h3><p className="car-example">{car.example}</p></div><div className="car-price"><strong>₹{car.dayRate.toLocaleString("en-IN")}</strong><span>starting / day</span></div></div>
            <div className="car-specs"><span><Gauge size={14} /> {car.transmission}</span><span><Users size={14} /> {car.seats} seats</span><span><Fuel size={14} /> {car.fuel}</span></div>
            <button className="button button-teal" type="button" onClick={() => chooseCar(car.slug)}>Enquire for this car</button>
          </div>
        </article>
      ))}
    </div>
  );
}
