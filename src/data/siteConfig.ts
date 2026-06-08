import homeContent from "./homeContent.json";

export type Highlight = {
  label: string;
  value: string;
  detail: string;
};

export type Room = {
  name: string;
  price: string;
  image: string;
  description: string;
};

export type SiteConfig = {
  hotelName: string;
  tagline: string;
  description: string;
  heroImage: string;
  heroEyebrow: string;
  bookingCta: string;
  secondaryCta: string;
  navigation: {
    rooms: string;
    amenities: string;
    contact: string;
  };
  intro: {
    eyebrow: string;
    title: string;
    copy: string;
  };
  roomsSection: {
    eyebrow: string;
    title: string;
  };
  amenitiesSection: {
    eyebrow: string;
    title: string;
  };
  contactSection: {
    eyebrow: string;
    title: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  highlights: Highlight[];
  rooms: Room[];
  amenities: string[];
  gallery: string[];
};

export const siteConfig = homeContent satisfies SiteConfig;

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: JsonObject, key: string): string {
  const value = source[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required text field: ${key}`);
  }

  return value.trim();
}

function readObject(source: JsonObject, key: string): JsonObject {
  const value = source[key];

  if (!isObject(value)) {
    throw new Error(`Missing required object field: ${key}`);
  }

  return value;
}

function readStringArray(source: JsonObject, key: string): string[] {
  const value = source[key];

  if (!Array.isArray(value)) {
    throw new Error(`Missing required list field: ${key}`);
  }

  return value.map((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      throw new Error(`Invalid text item at ${key}.${index}`);
    }

    return item.trim();
  });
}

function readObjectArray<T>(
  source: JsonObject,
  key: string,
  parser: (item: JsonObject) => T
): T[] {
  const value = source[key];

  if (!Array.isArray(value)) {
    throw new Error(`Missing required list field: ${key}`);
  }

  return value.map((item, index) => {
    if (!isObject(item)) {
      throw new Error(`Invalid object item at ${key}.${index}`);
    }

    return parser(item);
  });
}

function readImage(source: JsonObject, key: string): string {
  const value = readString(source, key);

  return validateImage(value, key);
}

function validateImage(value: string, key: string): string {
  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return value;
    }
  } catch {
    throw new Error(`Invalid image URL field: ${key}`);
  }

  throw new Error(`Invalid image URL field: ${key}`);
}

function readSection(source: JsonObject, key: string): SiteConfig["roomsSection"] {
  const section = readObject(source, key);

  return {
    eyebrow: readString(section, "eyebrow"),
    title: readString(section, "title")
  };
}

export function normalizeSiteConfig(value: unknown): SiteConfig {
  if (!isObject(value)) {
    throw new Error("Home content must be an object");
  }

  const contact = readObject(value, "contact");
  const navigation = readObject(value, "navigation");
  const intro = readObject(value, "intro");

  return {
    hotelName: readString(value, "hotelName"),
    tagline: readString(value, "tagline"),
    description: readString(value, "description"),
    heroImage: readImage(value, "heroImage"),
    heroEyebrow: readString(value, "heroEyebrow"),
    bookingCta: readString(value, "bookingCta"),
    secondaryCta: readString(value, "secondaryCta"),
    navigation: {
      rooms: readString(navigation, "rooms"),
      amenities: readString(navigation, "amenities"),
      contact: readString(navigation, "contact")
    },
    intro: {
      eyebrow: readString(intro, "eyebrow"),
      title: readString(intro, "title"),
      copy: readString(intro, "copy")
    },
    roomsSection: readSection(value, "roomsSection"),
    amenitiesSection: readSection(value, "amenitiesSection"),
    contactSection: readSection(value, "contactSection"),
    contact: {
      phone: readString(contact, "phone"),
      email: readString(contact, "email"),
      address: readString(contact, "address")
    },
    highlights: readObjectArray(value, "highlights", (item) => ({
      label: readString(item, "label"),
      value: readString(item, "value"),
      detail: readString(item, "detail")
    })),
    rooms: readObjectArray(value, "rooms", (item) => ({
      name: readString(item, "name"),
      price: readString(item, "price"),
      image: readImage(item, "image"),
      description: readString(item, "description")
    })),
    amenities: readStringArray(value, "amenities"),
    gallery: readStringArray(value, "gallery").map((image, index) =>
      validateImage(image, `gallery.${index}`)
    )
  };
}
