import type { SiteConfig } from "@/data/siteConfig";
import Image from "next/image";

type LandingPageProps = {
  config: SiteConfig;
};

export function LandingPage({ config }: LandingPageProps) {
  return (
    <main>
      <section className="hero" style={{ backgroundImage: `url(${config.heroImage})` }}>
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label={`${config.hotelName} home`}>
            {config.hotelName}
          </a>
          <div className="navLinks">
            <a href="/room">{config.navigation.rooms}</a>
            <a href="#amenities">{config.navigation.amenities}</a>
            <a href="#contact">{config.navigation.contact}</a>
          </div>
        </nav>

        <div className="heroOverlay" id="top">
          <p className="eyebrow">{config.heroEyebrow}</p>
          <h1>{config.hotelName}</h1>
          <p className="tagline">{config.tagline}</p>
          <p className="heroCopy">{config.description}</p>
          <div className="heroActions">
            <a className="button primary" href={`mailto:${config.contact.email}`}>
              {config.bookingCta}
            </a>
            <a className="button secondary" href="/room">
              {config.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="Hotel highlights">
        {config.highlights.map((item) => (
          <article className="stat" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="section intro">
        <div>
          <p className="eyebrow">{config.intro.eyebrow}</p>
          <h2>{config.intro.title}</h2>
        </div>
        <p>{config.intro.copy}</p>
      </section>

      <section className="section rooms" id="rooms">
        <div className="sectionHeader">
          <p className="eyebrow">{config.roomsSection.eyebrow}</p>
          <h2>{config.roomsSection.title}</h2>
        </div>
        <div className="roomGrid">
          {config.rooms.map((room) => (
            <article className="roomCard" key={room.name}>
              <Image
                src={room.image}
                alt={`${room.name} at ${config.hotelName}`}
                width={900}
                height={675}
              />
              <div>
                <div className="roomTitle">
                  <h3>{room.name}</h3>
                  <span>{room.price}</span>
                </div>
                <p>{room.description}</p>
                <a className="roomLink" href={room.url}>
                  View room
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="amenities" id="amenities">
        <div>
          <p className="eyebrow">{config.amenitiesSection.eyebrow}</p>
          <h2>{config.amenitiesSection.title}</h2>
        </div>
        <ul>
          {config.amenities.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
      </section>

      <section className="gallery" aria-label="Hotel gallery">
        {config.gallery.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`${config.hotelName} gallery ${index + 1}`}
            width={900}
            height={648}
          />
        ))}
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">{config.contactSection.eyebrow}</p>
          <h2>{config.contactSection.title}</h2>
        </div>
        <address>
          <span>{config.contact.address}</span>
          <a href={`tel:${config.contact.phone}`}>{config.contact.phone}</a>
          <a href={`mailto:${config.contact.email}`}>{config.contact.email}</a>
        </address>
      </section>
    </main>
  );
}
