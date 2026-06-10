"use client";

import { FormEvent, useState } from "react";
import type { Highlight, Room, SiteConfig } from "@/data/siteConfig";

export const adminContentSections = [
  { key: "hero", label: "Hero", title: "Hero", description: "Primary homepage copy and background image." },
  { key: "sections", label: "Sections", title: "Navigation and sections", description: "Labels and section headings shown across the page." },
  { key: "contact", label: "Contact", title: "Contact", description: "Booking email, phone number, and address." },
  { key: "highlights", label: "Highlights", title: "Highlights", description: "Stats and proof points under the hero." },
  { key: "rooms", label: "Rooms", title: "Rooms", description: "Room cards, prices, image URLs, and destination URLs." },
  { key: "amenities", label: "Amenities", title: "Amenities", description: "Included comfort list shown on the homepage." },
  { key: "gallery", label: "Gallery", title: "Gallery", description: "Homepage gallery image URLs." }
] as const;

export type AdminContentSection = (typeof adminContentSections)[number]["key"];

type HomeContentEditorProps = {
  initialContent: SiteConfig;
  section: AdminContentSection;
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
type RoomTextKey = Exclude<keyof Room, "images">;

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
};

export function isAdminContentSection(value: string): value is AdminContentSection {
  return adminContentSections.some((item) => item.key === value);
}

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
    url: "/rooms/new-room",
    image: "",
    images: [],
    description: ""
  };
}

export function HomeContentEditor({
  initialContent,
  section,
  username
}: HomeContentEditorProps) {
  const [content, setContent] = useState<SiteConfig>(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const activeSection = adminContentSections.find((item) => item.key === section);

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
  >(sectionKey: Section, key: keyof SiteConfig[Section], value: string) {
    setContent((current) => ({
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
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

  function updateRoom(index: number, key: RoomTextKey, value: string) {
    setContent((current) => ({
      ...current,
      rooms: current.rooms.map((room, itemIndex) =>
        itemIndex === index ? { ...room, [key]: value } : room
      )
    }));
  }

  function updateRoomImages(roomIndex: number, images: string[]) {
    setContent((current) => ({
      ...current,
      rooms: current.rooms.map((room, itemIndex) =>
        itemIndex === roomIndex
          ? {
              ...room,
              image: images[0] ?? "",
              images
            }
          : room
      )
    }));
  }

  function updateRoomImage(roomIndex: number, imageIndex: number, value: string) {
    const room = content.rooms[roomIndex];

    if (!room) {
      return;
    }

    updateRoomImages(
      roomIndex,
      room.images.map((image, itemIndex) => (itemIndex === imageIndex ? value : image))
    );
  }

  function addRoomImage(roomIndex: number, image = "") {
    const room = content.rooms[roomIndex];

    if (!room) {
      return;
    }

    updateRoomImages(roomIndex, [...room.images, image]);
  }

  function removeRoomImage(roomIndex: number, imageIndex: number) {
    const room = content.rooms[roomIndex];

    if (!room) {
      return;
    }

    updateRoomImages(
      roomIndex,
      room.images.filter((_, itemIndex) => itemIndex !== imageIndex)
    );
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

  async function handleRoomImageUpload(roomIndex: number, file: File | undefined) {
    if (!file) {
      return;
    }

    setStatus("saving");
    setMessage("Uploading image...");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData
    });
    const result = (await response.json()) as { url?: string; message?: string };

    if (!response.ok || !result.url) {
      setStatus("error");
      setMessage(result.message || "Could not upload image.");
      return;
    }

    addRoomImage(roomIndex, result.url);
    setStatus("idle");
    setMessage("Image uploaded. Save changes to publish it.");
  }

  function renderHeroFields() {
    return (
      <div className="adminGrid">
        <Field label="Hotel name" value={content.hotelName} onChange={(value) => updateRoot("hotelName", value)} />
        <Field label="Hero eyebrow" value={content.heroEyebrow} onChange={(value) => updateRoot("heroEyebrow", value)} />
        <Field label="Tagline" value={content.tagline} onChange={(value) => updateRoot("tagline", value)} />
        <Field label="Hero image URL" value={content.heroImage} onChange={(value) => updateRoot("heroImage", value)} />
        <Field label="Description" value={content.description} onChange={(value) => updateRoot("description", value)} multiline />
        <Field label="Booking CTA" value={content.bookingCta} onChange={(value) => updateRoot("bookingCta", value)} />
        <Field label="Secondary CTA" value={content.secondaryCta} onChange={(value) => updateRoot("secondaryCta", value)} />
      </div>
    );
  }

  function renderSectionFields() {
    return (
      <div className="adminGrid">
        <Field label="Rooms nav label" value={content.navigation.rooms} onChange={(value) => updateSection("navigation", "rooms", value)} />
        <Field label="Amenities nav label" value={content.navigation.amenities} onChange={(value) => updateSection("navigation", "amenities", value)} />
        <Field label="Contact nav label" value={content.navigation.contact} onChange={(value) => updateSection("navigation", "contact", value)} />
        <Field label="Intro eyebrow" value={content.intro.eyebrow} onChange={(value) => updateSection("intro", "eyebrow", value)} />
        <Field label="Intro title" value={content.intro.title} onChange={(value) => updateSection("intro", "title", value)} />
        <Field label="Intro copy" value={content.intro.copy} onChange={(value) => updateSection("intro", "copy", value)} multiline />
        <Field label="Rooms eyebrow" value={content.roomsSection.eyebrow} onChange={(value) => updateSection("roomsSection", "eyebrow", value)} />
        <Field label="Rooms title" value={content.roomsSection.title} onChange={(value) => updateSection("roomsSection", "title", value)} />
        <Field label="Amenities eyebrow" value={content.amenitiesSection.eyebrow} onChange={(value) => updateSection("amenitiesSection", "eyebrow", value)} />
        <Field label="Amenities title" value={content.amenitiesSection.title} onChange={(value) => updateSection("amenitiesSection", "title", value)} />
        <Field label="Contact eyebrow" value={content.contactSection.eyebrow} onChange={(value) => updateSection("contactSection", "eyebrow", value)} />
        <Field label="Contact title" value={content.contactSection.title} onChange={(value) => updateSection("contactSection", "title", value)} />
      </div>
    );
  }

  function renderContactFields() {
    return (
      <div className="adminGrid">
        <Field label="Phone" value={content.contact.phone} onChange={(value) => updateSection("contact", "phone", value)} />
        <Field label="Email" value={content.contact.email} onChange={(value) => updateSection("contact", "email", value)} type="email" />
        <Field label="Address" value={content.contact.address} onChange={(value) => updateSection("contact", "address", value)} />
      </div>
    );
  }

  function renderHighlightsFields() {
    return (
      <>
        <div className="adminSectionActions">
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
                <Field label="Value" value={highlight.value} onChange={(value) => updateHighlight(index, "value", value)} />
                <Field label="Label" value={highlight.label} onChange={(value) => updateHighlight(index, "label", value)} />
                <Field label="Detail" value={highlight.detail} onChange={(value) => updateHighlight(index, "detail", value)} />
              </div>
              <button
                className="adminDangerButton"
                type="button"
                onClick={() =>
                  setContent((current) => ({
                    ...current,
                    highlights: current.highlights.filter((_, itemIndex) => itemIndex !== index)
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderRoomsFields() {
    return (
      <>
        <div className="adminSectionActions">
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
                <Field label="Name" value={room.name} onChange={(value) => updateRoom(index, "name", value)} />
                <Field label="Price" value={room.price} onChange={(value) => updateRoom(index, "price", value)} />
                <Field label="Room URL" value={room.url} onChange={(value) => updateRoom(index, "url", value)} />
                <Field label="Description" value={room.description} onChange={(value) => updateRoom(index, "description", value)} multiline />
              </div>
              <div className="adminRoomImages">
                <div className="adminRoomImagesHeader">
                  <strong>Room images</strong>
                  <div className="adminRoomImageActions">
                    <button
                      className="adminSecondaryButton"
                      type="button"
                      onClick={() => addRoomImage(index)}
                    >
                      Add image URL
                    </button>
                    <label className="adminUploadButton">
                      Upload image
                      <input
                        accept="image/*"
                        type="file"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          event.currentTarget.value = "";
                          void handleRoomImageUpload(index, file);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="adminRoomImageList">
                  {room.images.map((image, imageIndex) => (
                    <div className="adminRoomImageItem" key={`room-${index}-image-${imageIndex}`}>
                      <div
                        aria-label={`${room.name || `Room ${index + 1}`} image ${imageIndex + 1}`}
                        className="adminImagePreview"
                        style={{ backgroundImage: image ? `url(${image})` : undefined }}
                      />
                      <Field
                        label={imageIndex === 0 ? "Primary image URL" : `Image ${imageIndex + 1} URL`}
                        value={image}
                        onChange={(value) => updateRoomImage(index, imageIndex, value)}
                      />
                      <button
                        className="adminDangerButton"
                        type="button"
                        onClick={() => removeRoomImage(index, imageIndex)}
                      >
                        Remove image
                      </button>
                    </div>
                  ))}
                  {room.images.length === 0 ? (
                    <p className="adminMuted">
                      Add at least one image URL or upload an image before saving this room.
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                className="adminDangerButton"
                type="button"
                onClick={() =>
                  setContent((current) => ({
                    ...current,
                    rooms: current.rooms.filter((_, itemIndex) => itemIndex !== index)
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderStringListFields(key: StringListKey, label: string) {
    return (
      <>
        <div className="adminSectionActions">
          <button
            className="adminSecondaryButton"
            type="button"
            onClick={() => addStringListItem(key)}
          >
            Add {label.toLowerCase()}
          </button>
        </div>
        <div className="adminList compact">
          {content[key].map((item, index) => (
            <div className="adminInlineItem" key={`${key}-${index}`}>
              <Field
                label={`${label} ${index + 1}${key === "gallery" ? " URL" : ""}`}
                value={item}
                onChange={(value) => updateStringList(key, index, value)}
              />
              <button
                className="adminDangerButton"
                type="button"
                onClick={() => removeStringListItem(key, index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderActiveFields() {
    switch (section) {
      case "hero":
        return renderHeroFields();
      case "sections":
        return renderSectionFields();
      case "contact":
        return renderContactFields();
      case "highlights":
        return renderHighlightsFields();
      case "rooms":
        return renderRoomsFields();
      case "amenities":
        return renderStringListFields("amenities", "Amenity");
      case "gallery":
        return renderStringListFields("gallery", "Image");
    }
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

      <nav className="adminTabs" aria-label="Admin content sections">
        {adminContentSections.map((item) => (
          <a
            className={item.key === section ? "active" : undefined}
            href={`/admin/${item.key}`}
            key={item.key}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <form className="adminForm" onSubmit={handleSubmit}>
        <section className="adminSection">
          <div className="adminSectionHeader">
            <div>
              <h2>{activeSection?.title}</h2>
              <p>{activeSection?.description}</p>
            </div>
          </div>
          {renderActiveFields()}
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
