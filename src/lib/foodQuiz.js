export const QUIZ_LENGTH = 5;

export const FOOD_QUESTIONS = [
  {
    question: "Which of these is technically a berry?",
    options: ["Strawberry", "Banana", "Cherry"],
    answer: 1,
    fact: "Bananas are berries, while strawberries and cherries are not. A true berry has seeds inside its flesh, and a banana qualifies.",
  },
  {
    question: "How long can honey stay edible?",
    options: ["About 10 years", "About 100 years", "Practically forever"],
    answer: 2,
    fact: "Honey has been found in ancient tombs and was still edible after thousands of years. Its low water content and acidity keep microbes away.",
  },
  {
    question: "Which of these is not a true nut?",
    options: ["Almond", "Chestnut", "Hazelnut"],
    answer: 0,
    fact: "Almonds are seeds of a drupe, not true nuts. Chestnuts and hazelnuts are the real deal.",
  },
  {
    question: "What makes chili peppers hot?",
    options: ["Capsaicin", "Piperine", "Curcumin"],
    answer: 0,
    fact: "Capsaicin is the compound behind the burn. It is measured on the Scoville scale, and milk cools it better than water.",
  },
  {
    question: "Where is most of a chili pepper's heat?",
    options: ["The seeds", "The white pith", "The skin"],
    answer: 1,
    fact: "The white membrane holding the seeds packs most of the capsaicin. Scraping it out tames the heat more than removing seeds.",
  },
  {
    question: "What color were carrots originally?",
    options: ["Purple", "White", "Red"],
    answer: 0,
    fact: "Early carrots were purple or yellow. The orange carrot was developed later, and purple carrots are still grown today.",
  },
  {
    question: "Which spice comes from tree bark?",
    options: ["Cinnamon", "Nutmeg", "Ginger"],
    answer: 0,
    fact: "Cinnamon is the dried inner bark of the cinnamon tree. It curls into rolls as it dries, which is why it comes in sticks.",
  },
  {
    question: "Which food is roughly 95 percent water?",
    options: ["Cucumber", "Bread", "Banana"],
    answer: 0,
    fact: "Cucumbers are mostly water, which is why they feel so refreshing and spoil quickly once sliced.",
  },
  {
    question: "What part of the plant is broccoli?",
    options: ["A flower bud", "A root", "A leaf"],
    answer: 0,
    fact: "Broccoli is the unopened flower head of the plant. Left too long, those green buds open into small yellow flowers.",
  },
  {
    question: "Which gas do bananas release that ripens other fruit?",
    options: ["Ethylene", "Methane", "Oxygen"],
    answer: 0,
    fact: "Bananas give off ethylene gas, which speeds up ripening. Storing them near unripe fruit makes it ripen faster.",
  },
  {
    question: "Which compound gives tomatoes their red color?",
    options: ["Lycopene", "Beta carotene", "Anthocyanin"],
    answer: 0,
    fact: "Lycopene is the pigment behind a tomato's red. Cooking tomatoes helps your body absorb more of it.",
  },
  {
    question: "Which crop is the world's most produced grain?",
    options: ["Corn", "Rice", "Wheat"],
    answer: 0,
    fact: "Corn leads global grain production, well ahead of wheat and rice, and much of it feeds animals or becomes fuel.",
  },
  {
    question: "What is saffron made from?",
    options: ["Flower stigmas", "Tree sap", "Root bark"],
    answer: 0,
    fact: "Saffron is hand-picked stigmas of the crocus flower, which is why it costs more per ounce than most foods.",
  },
  {
    question: "About how many seeds sit on the outside of one strawberry?",
    options: ["20", "200", "2,000"],
    answer: 1,
    fact: "A typical strawberry carries around 200 tiny seeds on its surface, each one technically a separate fruit.",
  },
];

export function pickQuestions() {
  return [...FOOD_QUESTIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, QUIZ_LENGTH);
}