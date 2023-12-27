import buildScryfallQuery from "./build-scryfall-query";
import searchOnScryfall from "./search-on-scryfall";
import searchScryfallInBatches from "./search-scryfall-in-batches";

vi.mock("./build-scryfall-query");
vi.mock("./search-on-scryfall");

describe("searchScryfallInBatches ", () => {
  beforeEach(() => {
    vi.mocked(searchOnScryfall).mockResolvedValue([{ name: "Card" }]);
    vi.mocked(buildScryfallQuery).mockReturnValue("query");
  });

  afterEach(() => {
    vi.mocked(searchOnScryfall).mockReset();
    vi.mocked(buildScryfallQuery).mockReset();
  });

  it("builds query with lookup options", async () => {
    await searchScryfallInBatches(
      ["abc", "def"],
      {
        excludeGoldBordered: true,
        excludeOversized: false,
      },
      vi.fn(),
    );

    expect(buildScryfallQuery).toHaveBeenCalledOnce();
    expect(buildScryfallQuery).toHaveBeenCalledWith(["abc", "def"], {
      excludeGoldBordered: true,
      excludeOversized: false,
    });
  });

  it("searches on scryfall", async () => {
    await searchScryfallInBatches(
      ["abc", "def"],
      {
        excludeGoldBordered: false,
        excludeOversized: false,
      },
      vi.fn(),
    );

    expect(searchOnScryfall).toHaveBeenCalledOnce();
    expect(searchOnScryfall).toHaveBeenCalledWith("query");
  });

  it("searches on scryfall for multiple batches of oracle ids", async () => {
    const oracleIds = [...Array(100)].map(function (_, index) {
      return String(index);
    });

    await searchScryfallInBatches(
      oracleIds,
      {
        excludeGoldBordered: false,
        excludeOversized: false,
      },
      vi.fn(),
    );

    expect(searchOnScryfall).toHaveBeenCalledTimes(6);
    expect(buildScryfallQuery).toHaveBeenCalledTimes(6);

    // this is kind of tedious and will break easilly if the constant
    // for how many ids to look up changes, so just check the first and last batch
    expect(buildScryfallQuery).toHaveBeenCalledWith(
      [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
      ],
      {
        excludeGoldBordered: false,
        excludeOversized: false,
      },
    );

    expect(buildScryfallQuery).toHaveBeenCalledWith(
      ["90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
      {
        excludeGoldBordered: false,
        excludeOversized: false,
      },
    );
  });

  it("it calls callback whenever a batch completes", async () => {
    const oracleIds = [...Array(100)].map(function (_, index) {
      return String(index);
    });
    const spy = vi.fn();

    await searchScryfallInBatches(
      oracleIds,
      {
        excludeGoldBordered: false,
        excludeOversized: false,
      },
      spy,
    );

    expect(spy).toBeCalledTimes(6);
  });

  it("sorts results by card name", async () => {
    vi.mocked(searchOnScryfall).mockResolvedValue([
      { name: "B Card" },
      { name: "Card" },
      { name: "A Card" },
    ]);

    const results = await searchScryfallInBatches(
      ["abc", "def"],
      {
        excludeGoldBordered: false,
        excludeOversized: false,
      },
      vi.fn(),
    );

    expect(results[0].name).toBe("A Card");
    expect(results[1].name).toBe("B Card");
    expect(results[2].name).toBe("Card");
  });
});
