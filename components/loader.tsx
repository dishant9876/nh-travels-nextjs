import Image from "next/image";

export function Loader() {
  return (
    <main className="loader">
      <Image src="/images/nh-travels-logo.jpg" alt="NH Travels" width={720} height={480} priority className="loader-logo" />
      <div className="loader-track"><span /></div>
      <p>Driven by trust</p>
    </main>
  );
}
