import { render, screen } from "@testing-library/svelte";
import Results from "./Results.svelte";

function createCardRow(name: string, qty: number, price: number) {
  const uri = name.toLowerCase().replaceAll(" ", "-");
  const tcgPlayerLink = price > 0 ? `https://example.com/tcg/${uri}` : "";
  return {
    qty,
    name,
    price,
    image: `https://example.com/${uri}`,
    scryfallLink: `https://example.com/scryfall/${uri}`,
    tcgPlayerLink,
  };
}

describe("Results", () => {
  it("creates a result for each card row", () => {
    render(Results, {
      props: {
        results: [
          createCardRow("Card A", 1, 123.12),
          createCardRow("Card B", 2, 456.5),
          createCardRow("Card C", 3, 50.51),
        ],
      },
    });

    const tableBody = screen.getByTestId("result-body");

    expect(tableBody.querySelectorAll("tr").length).toBe(3);

    expect(screen.getByTestId("result-row-0-qty")).toHaveTextContent("1");
    expect(screen.getByTestId("result-row-1-qty")).toHaveTextContent("2");
    expect(screen.getByTestId("result-row-2-qty")).toHaveTextContent("3");

    expect(screen.getByTestId("result-row-0-name")).toHaveTextContent("Card A");
    expect(
      screen.getByTestId("result-row-0-name").querySelector("a").href,
    ).toBe("https://example.com/scryfall/card-a");
    expect(screen.getByTestId("result-row-1-name")).toHaveTextContent("Card B");
    expect(
      screen.getByTestId("result-row-1-name").querySelector("a").href,
    ).toBe("https://example.com/scryfall/card-b");
    expect(screen.getByTestId("result-row-2-name")).toHaveTextContent("Card C");
    expect(
      screen.getByTestId("result-row-2-name").querySelector("a").href,
    ).toBe("https://example.com/scryfall/card-c");

    expect(screen.getByTestId("result-row-0-price")).toHaveTextContent(
      "$123.12",
    );
    expect(
      screen.getByTestId("result-row-0-price").querySelector("a").href,
    ).toBe("https://example.com/tcg/card-a");
    expect(screen.getByTestId("result-row-1-price")).toHaveTextContent(
      "$913.00",
    );
    expect(
      screen.getByTestId("result-row-1-price").querySelector("a").href,
    ).toBe("https://example.com/tcg/card-b");
    expect(screen.getByTestId("result-row-2-price")).toHaveTextContent(
      "$151.53",
    );
    expect(
      screen.getByTestId("result-row-2-price").querySelector("a").href,
    ).toBe("https://example.com/tcg/card-c");
  });

  it("calculates the total price of the deck", () => {
    render(Results, {
      props: {
        results: [
          createCardRow("Card A", 1, 123.12),
          createCardRow("Card B", 1, 456.5),
        ],
      },
    });

    const totalPrice = screen.getByTestId("total-price");

    expect(totalPrice).toHaveTextContent("Total: $579.62");
  });

  it("accounts for qty in price calculation", () => {
    render(Results, {
      props: {
        results: [
          createCardRow("Card A", 2, 123.12),
          createCardRow("Card B", 1, 456.5),
        ],
      },
    });

    const totalPrice = screen.getByTestId("total-price");
    const firstRowPrice = screen.getByTestId("result-row-0-price");

    expect(totalPrice).toHaveTextContent("Total: $702.74");
    expect(firstRowPrice).toHaveTextContent("$246.24");
  });

  it("does not render tcg player link if not provided", () => {
    render(Results, {
      props: {
        results: [
          createCardRow("Card A", 2, 0),
          createCardRow("Card B", 1, 456.5),
        ],
      },
    });

    const firstRowPrice = screen.getByTestId("result-row-0-price");

    expect(firstRowPrice.querySelector("a")).toBeFalsy();
  });
});
