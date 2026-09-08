import Image from "next/image";

export function Mark() {
  return (
    <div className="brand-logo">
      <Image src="/creative-for-climate-logo.jpg" alt="Creative for Climate" fill priority sizes="180px" />
    </div>
  );
}
