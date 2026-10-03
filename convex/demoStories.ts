import type { Reel, Insight } from "./content";
// Hand-written examples for the bundled transcript only. Never passed off as AI analysis.
export function demoStories(q: string[]): Reel[] {
  const build = (
    title: string,
    insight: Insight,
    script: string[],
    onScreen: string[],
    caption: string,
    sources: string[],
  ): Reel => ({
    title,
    insight,
    script,
    onScreen,
    caption,
    sources,
    grounding: [...new Set([...script, ...onScreen, caption])].map((text) => ({
      text,
      sources,
    })),
  });
  return [
    build(
      "When the numbers arrive after the meeting",
      {
        angle: "pain",
        painPoint:
          "Weekly updates scattered across five spreadsheets arrive too late to help the meeting.",
        emotion:
          "The customer does not explicitly name an emotion about the reporting task.",
        emotionBasis: "not_present",
        story:
          "Reporting loses its purpose when finding the numbers takes longer than the meeting.",
        evidence: [q[0], q[1]],
      },
      [
        "Every Friday, the same chase: updates across five different spreadsheets.",
        "And by the time the right numbers turn up? The meeting is already over.",
        "That is the problem with scattered reporting: the update arrives after the moment it was needed.",
        "This customer now opens one page and knows what needs their attention.",
        "Less hunting for the update. A clearer view of what needs attention.",
      ],
      [
        "Five spreadsheets. One Friday.",
        "The numbers arrive too late.",
        "One page. A clearer view.",
      ],
      "The customer’s problem was not a lack of numbers. It was finding the right ones before the meeting ended. Their change: one page that shows what needs attention.",
      [q[0], q[1], q[2]],
    ),
    build(
      "“I wish we had made the switch sooner.”",
      {
        angle: "emotion",
        painPoint: "Friday afternoons went into chasing scattered updates.",
        emotion:
          "Regret about waiting to switch; relief is a possible reading of getting Friday afternoons back.",
        emotionBasis: "inferred",
        story:
          "The emotional hook is wishing they had changed sooner, rather than another reporting feature.",
        evidence: [q[0], q[3], q[5]],
      },
      [
        "“I wish we had made the switch sooner.”",
        "That is how this customer looks back on the change.",
        "Before it, Fridays meant chasing updates across five spreadsheets.",
        "After it, their words were: “I got my Friday afternoons back.”",
        "The story here is not just about reporting. It is about getting part of their week back.",
      ],
      [
        "“I wish we had made the switch sooner.”",
        "“I got my Friday afternoons back.”",
      ],
      "“I wish we had made the switch sooner.” A customer’s reflection after moving away from the Friday spreadsheet chase and getting their afternoons back.",
      [q[0], q[3], q[5]],
    ),
    build(
      "Less reporting. More helping customers.",
      {
        angle: "takeaway",
        painPoint: "Reporting competed with time spent helping customers.",
        emotion: "No emotion is explicitly stated in this team outcome.",
        emotionBasis: "not_present",
        story:
          "The useful takeaway is what the team can spend its time on after reporting takes less of it.",
        evidence: [q[2], q[4]],
      },
      [
        "What changes when your team spends less time reporting?",
        "For this customer, the answer was more time helping customers.",
        "They open one page and know what needs their attention.",
        "The takeaway is not another report. It is what their team gets to spend more time doing.",
      ],
      ["Less time reporting.", "More time helping customers."],
      "“My team spends less time reporting and more time helping customers.” That is this customer’s takeaway: a clearer view of what needs attention, and more time helping people.",
      [q[2], q[4]],
    ),
  ];
}
