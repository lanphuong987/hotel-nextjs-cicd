import Image from "next/image";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

type RoomPageProps = {
  params: {
    slug: string;
  };
};

function slugFromRoomUrl(url: string) {
  if (!url.startsWith("/rooms/")) {
    return "";
  }

  return url.replace("/rooms/", "").replace(/\/$/, "");
}

export default async function RoomPage({ params }: RoomPageProps) {
  const content = await getSiteContent();
  const room = content.rooms.find((item) => slugFromRoomUrl(item.url) === params.slug);

  if (!room) {
    notFound();
  }

  return (
    <main className="roomDetailPage">
      <nav className="roomDetailNav" aria-label="Room navigation">
        <a className="brand" href="/">
          {content.hotelName}
        </a>
        <a className="adminLink" href="/#rooms">
          Back home
        </a>
        <a className="adminLink" href="/room">
          All rooms
        </a>
      </nav>
      <section className="roomDetailHero">
        <div>
          <p className="eyebrow">Rooms and suites</p>
          <h1>{room.name}</h1>
          <p className="tagline">{room.price}</p>
          <p className="heroCopy">{room.description}</p>
          <a className="button primary" href={`mailto:${content.contact.email}`}>
            {content.bookingCta}
          </a>
        </div>
        <Image
          src={room.image}
          alt={`${room.name} at ${content.hotelName}`}
          width={1200}
          height={900}
          priority
        />
      </section>
      <section className="roomDetailGallery" aria-label={`${room.name} gallery`}>
        {room.images.map((image, index) => (
          <Image
            key={`${room.name}-${image}`}
            src={image}
            alt={`${room.name} gallery ${index + 1}`}
            width={900}
            height={675}
          />
        ))}
      </section>
    </main>
  );
}
