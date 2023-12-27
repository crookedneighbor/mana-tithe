import { render, screen } from "@testing-library/svelte";
import CardTooltip from "./CardTooltip.svelte";

describe("CardTooltip", () => {
  it("does not display if no card is passed", () => {
    render(CardTooltip, {
      props: {
        card: null,
        mouseEvent: {} as MouseEvent,
      },
    });

    const cardContainer = screen.queryByTestId("card-container");

    expect(cardContainer).toBeFalsy();
  });

  it("displays when a card is passed", () => {
    const card = {
      qty: 1,
      name: "Card Name",
      price: 123,
      image: "https://example.com/card.jpg",
      scryfallLink: "https://exmaple.com/scryfall-link",
      tcgPlayerLink: "https://exmaple.com/tcg-link",
    };
    const mouseEvent = {
      clientX: 100,
      clientY: 200,
    } as MouseEvent;
    render(CardTooltip, {
      props: {
        card,
        mouseEvent,
      },
    });

    const cardContainer = screen.getByTestId("card-container");
    const img = cardContainer.querySelector("img");

    expect(cardContainer.style.left).toEqual("150px");
    expect(cardContainer.style.top).toEqual("170px");
    expect(img?.src).toEqual(card.image);
    expect(img?.alt).toEqual("Card Name card image");
  });
});
