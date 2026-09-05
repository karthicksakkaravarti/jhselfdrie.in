import { Phone } from "lucide-react";
import { site } from "@/content/site";
import { TrackedLink } from "./TrackedLink";

export function Header() {
  return <header className="site-header"><nav className="nav shell" aria-label="Main navigation"><a className="brand" href="#top"><span className="brand-mark">JH</span><span>JH Self Drive</span></a><div className="nav-links"><a className="nav-link" href="#fleet">Our cars</a><a className="nav-link" href="#how">How it works</a><a className="nav-link" href="#pricing">Pricing</a><a className="nav-link" href="#faq">FAQs</a></div><TrackedLink className="nav-call" event="call_click" href={`tel:${site.phoneE164}`}><Phone size={15} /> {site.phoneDisplay}</TrackedLink></nav></header>;
}
