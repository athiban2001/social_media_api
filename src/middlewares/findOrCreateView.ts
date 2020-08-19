import { View } from "../entity/View.entity";

export const findOrCreateView = async (userId: number): Promise<View> => {
    let view = await View.findOne({ where: { userId } });
    if (!view) {
        view = await View.create({ userId }).save();
    }

    return view;
};
