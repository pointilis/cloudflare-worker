import { z } from "zod";

const MilestoneItem = z.object({
    order: z.number(),
    duration: z.string(),
    description: z.string(),
    title: z.string(),
});

export const MilestoneReasoning = z.object({
    milestones: z.array(MilestoneItem),
});