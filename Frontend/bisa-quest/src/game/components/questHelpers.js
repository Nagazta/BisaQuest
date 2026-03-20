export const buildQuestDialogue = (quest, item) => [
    {
        bisayaText: `Tan-awa ang ${item.labelBisaya}! Sulayi kining mini-game!`,
        englishText: `Look at the ${item.labelEnglish}! Try this mini-game!`,
    },
    {
        bisayaText: quest.instructionBisaya,
        englishText: quest.instructionEnglish,
    },
];
