"use client";

import { FormEvent, useState } from "react";
import type { Highlight, Room, SiteConfig } from "@/data/siteConfig";

type HomeContentEditorProps = {
  initialContent: SiteConfig;
  username: string;
};

type RootTextKey =
  | "hotelName"
  | "tagline"
  | "description"
  | "heroImage"
  | "heroEyebrow"
  | "bookingCta"
  | "secondaryCta";

type StringListKey = "amenities" | "gallery";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text"
}: FieldProps) {
  return (
    <label className="adminField">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function emptyHighlight(): Highlight {
  return {
    label: "",
    value: "",
    detail: ""
  };
}

function emptyRoom(): Room {
  return {
    name: "",
    price: "",
    image: "",
    description: ""
  };
}

export function HomeContentEditor({ initialContent, username }: HomeContentEditorProps) {
  const [content, setContent] = useState<SiteConfig>(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  function updateRoot(key: RootTextKey, value: string) {
    setContent((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateSection<
    Section extends
      | "navigation"
      | "intro"
      | "roomsSection"
      | "amenitiesSection"
      | "contactSection"
      | "contact"
  >(section: Section, key: keyof SiteConfig[Section], value: string) {
    setContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value
      }
    }));
  }

  function updateHighlight(index: number, key: keyof Highlight, value: string) {
    setContent((current) => ({
      ...current,
      highlights: current.highlights.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function updateRoom(index: number, key: keyof Room, value: string) {
    setContent((current) => ({
      ...current,
      rooms: current.rooms.map((room, itemIndex) =>
        itemIndex === index ? { ...room, [key]: value } : room
      )
    }));
  }

  function updateStringList(key: StringListKey, index: number, value: string) {
    setContent((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    }));
  }

  function addStringListItem(key: StringListKey) {
    setContent((current) => ({
      ...current,
      [key]: [...current[key], ""]
    }));
  }

  function removeStringListItem(key: StringListKey, index: number) {
    setContent((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("Saving changes...");

    const response = await fetch("/api/home-content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(content)
    });
    const result = (await response.json()) as SiteConfig | { message?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(
        "message" in result && result.message
          ? result.message
          : "Could not save changes."
      );
      return;
    }

    setContent(result as SiteConfig);
    setStatus("saved");
    setMessage("Changes saved. Refresh the homepage to view the latest content.");
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <p className="eyebrow">Content backend</p>
          <h1>Home content</h1>
          <p className="adminUser">Signed in as {username}</p>
        </div>
        <div className="adminHeaderActions">
          <a className="adminLink" href="/">
            View homepage
          </a>
          <button className="adminSecondaryButton" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <form className="adminForm" onSubmit={handleSubmit}>
        <section className="adminSection">
          <div className="adminSectionHeader">
            <h2>Hero</h2>
            <p>Primary homepage copy and background image.</p>
          </div>
          <div className="adminGrid">
            <Field
              label="Hotel name"
              value={content.hotelName}
              onChange={(value) => updateRoot("hotelName", value)}
            />
            <Field
              label="Hero eyebrow"
              value={content.heroEyebrow}
              onChange={(value) => updateRoot("heroEyebrow", value)}
            />
            <Field
              label="Tagline"
              value={content.tagline}
              onChange={(value) => updateRoot("tagline", value)}
            />
            <Field
              label="Hero image URL"
              value={content.heroImage}
              onChange={(value) => updateRoot("heroImage", value)}
            />
            <Field
              label="Description"
              value={content.description}
              onChange={(value) => updateRoot("description", value)}
              multiline
            />
            <Field
              label="Booking CTA"
              value={content.bookingCta}
              onChange={(value) => updateRoot("bookingCta", value)}
            />
            <Field
              label="Secondary CTA"
              value={content.secondaryCta}
              onChange={(value) => updateRoot("secondaryCta", value)}
            />
          </div>
        </section>

        <section className="adminSection">
          <div className="adminSectionHeader">
            <h2>Navigation and sections</h2>
            <p>Labels and section headings shown across the page.</p>
          </div>
          <div className="adminGrid">
            <Field
              label="Rooms nav label"
              value={content.navigation.rooms}
              onChange={(value) => updateSection("navigation", "rooms", value)}
            />
            <Field
              label="Amenities nav label"
              value={content.navigation.amenities}
              onChange={(value) => updateSection("navigation", "amenities", value)}
            />
            <Field
              label="Contact nav label"
              value={content.navigation.contact}
              onChange={(value) => updateSection("navigation", "contact", value)}
            />
            <Field
              label="Intro eyebrow"
              value={content.intro.eyebrow}
              onChange={(value) => updateSection("intro", "eyebrow", value)}
            />
            <Field
              label="Intro title"
              value={content.intro.title}
              onChange={(value) => updateSection("intro", "title", value)}
            />
            <Field
              label="Intro copy"
              value={content.intro.copy}
              onChange={(value) => updateSection("intro", "copy", value)}
              multiline
            />
            <Field
              label="Rooms eyebrow"
              value={content.roomsSection.eyebrow}
              onChange={(value) =>
                updateSection("roomsSection", "eyebrow", value)
              }
            />
            <Field
              label="Rooms title"
              value={content.roomsSection.title}
              onChange={(value) => updateSection("roomsSection", "title", value)}
            />
            <Field
              label="Amenities eyebrow"
              value={content.amenitiesSection.eyebrow}
              onChange={(value) =>
                updateSection("amenitiesSection", "eyebrow", value)
              }
            />
            <Field
              label="Amenities title"
              value={content.amenitiesSection.title}
              onChange={(value) =>
                updateSection("amenitiesSection", "title", value)
              }
            />
            <Field
              label="Contact eyebrow"
              value={content.contactSection.eyebrow}
              onChange={(value) =>
                updateSection("contactSection", "eyebrow", value)
              }
            />
            <Field
              label="Contact title"
              value={content.contactSection.title}
              onChange={(value) => updateSection("contactSection", "title", value)}
            />
          </div>
        </section>

        <section className="adminSection">
          <div className="adminSectionHeader">
            <h2>Contact</h2>
            <p>Booking email, phone number, and address.</p>
          </div>
          <div className="adminGrid">
            <Field
              label="Phone"
              value={content.contact.phone}
              onChange={(value) => updateSection("contact", "phone", value)}
            />
            <Field
              label="Email"
              value={content.contact.email}
              onChange={(value) => updateSection("contact", "email", value)}
              type="email"
            />
            <Field
              label="Address"
              value={content.contact.address}
              onChange={(value) => updateSection("contact", "address", value)}
            />
          </div>
        </section>

        <section className="adminSection">
          <div className="adminSectionHeader">
            <h2>Highlights</h2>
            <button
              className="adminSecondaryButton"
              type="button"
              onClick={() =>
                setContent((current) => ({
                  ...current,
                  highlights: [...current.highlights, emptyHighlight()]
                }))
              }
            >
              Add highlight
            </button>
          </div>
          <div className="adminList">
            {content.highlights.map((highlight, index) => (
              <div className="adminItem" key={`highlight-${index}`}>
                <div className="adminGrid">
                  <Field
                    label="Value"
                    value={highlight.value}
                    onChange={(value) => updateHighlight(index, "value", value)}
                  />
                  <Field
                    label="Label"
                    value={highlight.label}
                    onChange={(value) => updateHighlight(index, "label", value)}
                  />
                  <Field
                    label="Detail"
                    value={highlight.detail}
                    onChange={(value) => updateHighlight(index, "detail", value)}
                  />
                </div>
                <button
                  className="adminDangerButton"
                  type="button"
                  onClick={() =>
                    setContent((current) => ({
                      ...current,
                      highlights: current.highlights.filter(
                        (_, itemIndex) => itemIndex !== index
                      )
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="adminSection">
          <div className="adminSectionHeader">
            <h2>Rooms</h2>
            <button
              className="adminSecondaryButton"
              type="button"
              onClick={() =>
                setContent((current) => ({
                  ...current,
                  rooms: [...current.rooms, emptyRoom()]
                }))
              }
            >
              Add room
            </button>
          </div>
          <div className="adminList">
            {content.rooms.map((room, index) => (
              <div className="adminItem" key={`room-${index}`}>
                <div className="adminGrid">
                  <Field
                    label="Name"
                    value={room.name}
                    onChange={(value) => updateRoom(index, "name", value)}
                  />
                  <Field
                    label="Price"
                    value={room.price}
                    onChange={(value) => updateRoom(index, "price", value)}
                  />
                  <Field
                    label="Image URL"
                    value={room.image}
                    onChange={(value) => updateRoom(index, "image", value)}
                  />
                  <Field
                    label="Description"
                    value={room.description}
                    onChange={(value) => updateRoom(index, "description", value)}
                    multiline
                  />
                </div>
                <button
                  className="adminDangerButton"
                  type="button"
                  onClick={() =>
                    setContent((current) => ({
                      ...current,
                      rooms: current.rooms.filter(
                        (_, itemIndex) => itemIndex !== index
                      )
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="adminSection">
          <div className="adminSectionHeader">
            <h2>Amenities</h2>
            <button
              className="adminSecondaryButton"
              type="button"
              onClick={() => addStringListItem("amenities")}
            >
              Add amenity
            </button>
          </div>
          <div className="adminList compact">
            {content.amenities.map((amenity, index) => (
              <div className="adminInlineItem" key={`amenity-${index}`}>
                <Field
                  label={`Amenity ${index + 1}`}
                  value={amenity}
                  onChange={(value) => updateStringList("amenities", index, value)}
                />
                <button
                  className="adminDangerButton"
                  type="button"
                  onClick={() => removeStringListItem("amenities", index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="adminSection">
          <div className="adminSectionHeader">
            <h2>Gallery</h2>
            <button
              className="adminSecondaryButton"
              type="button"
              onClick={() => addStringListItem("gallery")}
            >
              Add image
            </button>
          </div>
          <div className="adminList compact">
            {content.gallery.map((image, index) => (
              <div className="adminInlineItem" key={`gallery-${index}`}>
                <Field
                  label={`Image ${index + 1} URL`}
                  value={image}
                  onChange={(value) => updateStringList("gallery", index, value)}
                />
                <button
                  className="adminDangerButton"
                  type="button"
                  onClick={() => removeStringListItem("gallery", index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="adminSaveBar">
          <button
            className="adminPrimaryButton"
            type="submit"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Save changes"}
          </button>
          {message ? <p className={`adminStatus ${status}`}>{message}</p> : null}
        </div>
      </form>
    </main>
  );
}
