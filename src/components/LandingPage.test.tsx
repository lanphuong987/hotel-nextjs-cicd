import { render, screen } from "@testing-library/react";
import { LandingPage } from "./LandingPage";
import { siteConfig } from "@/data/siteConfig";

describe("LandingPage", () => {
  it("renders key hotel content from config", () => {
    render(<LandingPage config={siteConfig} />);

    expect(screen.getAllByText(siteConfig.hotelName)[0]).toBeInTheDocument();
    expect(screen.getByText(siteConfig.tagline)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.rooms[0].name)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.amenities[0])).toBeInTheDocument();
    expect(screen.getByText(siteConfig.contact.email)).toBeInTheDocument();
  });
});
