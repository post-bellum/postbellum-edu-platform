import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <Image
        src="/logo.svg"
        alt="Post Bellum logo"
        width={400} // Doubled the size
        height={200} // Adjust based on your logo's aspect ratio
        priority
      />
    </main>
  );
}
