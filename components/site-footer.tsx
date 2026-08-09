import Image from "next/image";

export function SiteFooter() {
  return <footer>
    <div className="footer-brand"><Image src="/images/nh-travels-logo.jpg" alt="NH Travels" width={130} height={86}/><span>Driven by trust.</span></div>
    <div><b>Routes</b><p>Gorakhpur · Ayodhya · Lucknow · Kanpur</p></div>
    <div><b>Daily service</b><p>Gorakhpur 7:00 AM → Kanpur 2:00 PM<br/>Kanpur 4:00 PM → Gorakhpur 12:00 AM</p></div>
  </footer>;
}
