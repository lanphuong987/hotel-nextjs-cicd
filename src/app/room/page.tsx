import Image from "next/image";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function RoomCatalogPage() {
  const content = await getSiteContent();

  return (
    <main className="roomCatalogPage">
      <nav className="roomDetailNav" aria-label="Room catalog navigation">
        <a className="brand" href="/">
          {content.hotelName}
        </a>
        <a className="adminLink" href="/">
          Home
        </a>
      </nav>

      <section className="roomCatalogHeader">
        <p className="eyebrow">{content.roomsSection.eyebrow}</p>
        <h1>{content.roomsSection.title}</h1>
        <p>
          Browse each room, compare the mood through its images, and book directly
          with the hotel team.
        </p>
      </section>

      <section className="roomCatalogGrid" aria-label="Hotel rooms">
        {content.rooms.map((room) => (
          <article className="roomCatalogCard" key={room.name}>
            <a href={room.url}>
              <Image
                src={room.image}
                alt={`${room.name} at ${content.hotelName}`}
                width={900}
                height={675}
              />
            </a>
            <div className="roomCatalogThumbs" aria-label={`${room.name} images`}>
              {room.images.slice(0, 4).map((image, index) => (
                <Image
                  key={`${room.name}-${image}`}
                  src={image}
                  alt={`${room.name} preview ${index + 1}`}
                  width={220}
                  height={160}
                />
              ))}
            </div>
            <div className="roomCatalogBody">
              <div className="roomTitle">
                <h2>{room.name}</h2>
                <span>{room.price}</span>
              </div>
              <p>{room.description}</p>
              <div className="roomCatalogActions">
                <a className="adminLink" href={room.url}>
                  View details
                </a>
                <a className="adminPrimaryButton" href={`mailto:${content.contact.email}`}>
                  {content.bookingCta}
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
