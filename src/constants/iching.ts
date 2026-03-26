export interface Hexagram {
  number: number;
  binary: string; // 6 bits, from bottom to top (e.g., "111111" for The Creative)
  name: string;
  chineseName: string;
  meaning: string;
  judgment?: string;
  image?: string;
}

export const TRIGRAMS: Record<string, { name: string, element: string, attribute: string }> = {
  "111": { name: "Qián", element: "Heaven", attribute: "Strength" },
  "000": { name: "Kūn", element: "Earth", attribute: "Devotion" },
  "100": { name: "Zhèn", element: "Thunder", attribute: "Inciting Movement" },
  "010": { name: "Kǎn", element: "Water", attribute: "Dangerous" },
  "001": { name: "Gèn", element: "Mountain", attribute: "Resting" },
  "011": { name: "Xùn", element: "Wind/Wood", attribute: "Penetrating" },
  "101": { name: "Lí", element: "Fire", attribute: "Clinging" },
  "110": { name: "Duì", element: "Lake", attribute: "Joyous" },
};

export const HEXAGRAMS: Hexagram[] = [
  { 
    number: 1, 
    binary: "111111", 
    name: "The Creative", 
    chineseName: "Qián", 
    meaning: "Heaven, strength, persistence, the father.",
    judgment: "The Creative works sublime success, furthering through perseverance.",
    image: "The movement of heaven is full of power. Thus the superior man makes himself strong and untiring."
  },
  { 
    number: 2, 
    binary: "000000", 
    name: "The Receptive", 
    chineseName: "Kūn", 
    meaning: "Earth, yielding, devotion, the mother.",
    judgment: "The Receptive brings about sublime success, furthering through the perseverance of a mare.",
    image: "The earth's condition is receptive devotion. Thus the superior man who has breadth of character carries the outer world."
  },
  { 
    number: 3, 
    binary: "100010", 
    name: "Difficulty at the Beginning", 
    chineseName: "Zhūn", 
    meaning: "Sprouting, growth through obstacles.",
    judgment: "Difficulty at the Beginning works supreme success, furthering through perseverance.",
    image: "Clouds and thunder: the image of Difficulty at the Beginning. Thus the superior man brings order out of confusion."
  },
  { 
    number: 4, 
    binary: "010001", 
    name: "Youthful Folly", 
    chineseName: "Méng", 
    meaning: "Inexperience, the need for a teacher.",
    judgment: "Youthful Folly has success. It is not I who seek the young fool; the young fool seeks me.",
    image: "A spring wells up at the foot of the mountain: the image of Youth. Thus the superior man fosters his character by thoroughness in all that he does."
  },
  { 
    number: 5, 
    binary: "111010", 
    name: "Waiting", 
    chineseName: "Xū", 
    meaning: "Patience, nourishment, preparing for action.",
    judgment: "Waiting. If you are sincere, you have light and success. Perseverance brings good fortune.",
    image: "Clouds rise up to heaven: the image of Waiting. Thus the superior man eats and drinks, and is of good cheer."
  },
  { 
    number: 6, 
    binary: "010111", 
    name: "Conflict", 
    chineseName: "Sòng", 
    meaning: "Dispute, the need for caution and mediation.",
    judgment: "Conflict. You are sincere and are being obstructed. A cautious halt halfway brings good fortune.",
    image: "Heaven and water go their separate ways: the image of Conflict. Thus in all his transactions the superior man carefully considers the beginning."
  },
  { 
    number: 7, 
    binary: "010000", 
    name: "The Army", 
    chineseName: "Shī", 
    meaning: "Discipline, leadership, collective effort.",
    judgment: "The Army. The army needs perseverance and a strong man. Good fortune without blame.",
    image: "In the middle of the earth is water: the image of the Army. Thus the superior man increases his masses by generosity toward the people."
  },
  { 
    number: 8, 
    binary: "000010", 
    name: "Holding Together", 
    chineseName: "Bǐ", 
    meaning: "Union, cooperation, finding common ground.",
    judgment: "Holding Together brings good fortune. Inquire of the oracle once again whether you possess sublimity, constancy, and perseverance.",
    image: "On the earth is water: the image of Holding Together. Thus the kings of antiquity made a gift of the different states and maintained friendly relations with the feudal lords."
  },
  { 
    number: 9, 
    binary: "111011", 
    name: "Small Taming", 
    chineseName: "Xiǎo Chù", 
    meaning: "Gentle persuasion, small gains, accumulation.",
    judgment: "The Taming Power of the Small has success. Dense clouds, no rain from our western region.",
    image: "The wind drives across the heaven: the image of the Taming Power of the Small. Thus the superior man refines the outward aspect of his nature."
  },
  { 
    number: 10, 
    binary: "110111", 
    name: "Treading", 
    chineseName: "Lǚ", 
    meaning: "Conduct, stepping carefully, respect.",
    judgment: "Treading. Treading upon the tail of the tiger. It does not bite the man. Success.",
    image: "Heaven above, the lake below: the image of Treading. Thus the superior man discriminates between high and low, and thereby fortifies the minds of the people."
  },
  { 
    number: 11, 
    binary: "111000", 
    name: "Peace", 
    chineseName: "Tài", 
    meaning: "Harmony, prosperity, heaven and earth meeting.",
    judgment: "Peace. The small departs, the great approaches. Good fortune. Success.",
    image: "Heaven and earth unite: the image of Peace. Thus the ruler divides and completes the course of heaven and earth; he furthers and regulates the gifts of heaven and earth, and so aids the people."
  },
  { 
    number: 12, 
    binary: "000111", 
    name: "Standstill", 
    chineseName: "Pǐ", 
    meaning: "Stagnation, lack of communication, decline.",
    judgment: "Standstill. Evil people do not further the perseverance of the superior man. The great departs, the small approaches.",
    image: "Heaven and earth do not unite: the image of Standstill. Thus the superior man falls back upon his inner worth in order to escape the difficulties."
  },
  { 
    number: 13, 
    binary: "101111", 
    name: "Fellowship", 
    chineseName: "Tóng Rén", 
    meaning: "Community, shared goals, universal brotherhood.",
    judgment: "Fellowship with Men in the open. Success. It furthers one to cross the great water.",
    image: "Heaven together with fire: the image of Fellowship with Men. Thus the superior man organizes the clans and makes distinctions between things."
  },
  { 
    number: 14, 
    binary: "111101", 
    name: "Great Possession", 
    chineseName: "Dà Yǒu", 
    meaning: "Abundance, supreme success, clarity.",
    judgment: "Possession in Great Measure. Supreme success.",
    image: "Fire in heaven above: the image of Possession in Great Measure. Thus the superior man curbs evil and furthers good, and thereby obeys the benevolent will of heaven."
  },
  { 
    number: 15, 
    binary: "001000", 
    name: "Modesty", 
    chineseName: "Qiān", 
    meaning: "Humility, balance, the high being brought low.",
    judgment: "Modesty creates success. The superior man carries things through.",
    image: "Within the earth, a mountain: the image of Modesty. Thus the superior man reduces that which is too much, and augments that which is too little."
  },
  { 
    number: 16, 
    binary: "000100", 
    name: "Enthusiasm", 
    chineseName: "Yù", 
    meaning: "Inspiration, movement, music, preparation.",
    judgment: "Enthusiasm. It furthers one to install helpers and to set armies in motion.",
    image: "Thunder comes resounding out of the earth: the image of Enthusiasm. Thus the ancient kings made music in order to honor merit, and offered it with splendor to the Supreme Deity."
  },
  { 
    number: 17, 
    binary: "100110", 
    name: "Following", 
    chineseName: "Suí", 
    meaning: "Adaptability, joy, resting at night.",
    judgment: "Following has supreme success. Perseverance furthers. No blame.",
    image: "Thunder in the middle of the lake: the image of Following. Thus the superior man at nightfall goes indoors for rest and recuperation."
  },
  { 
    number: 18, 
    binary: "011001", 
    name: "Work on the Decayed", 
    chineseName: "Gǔ", 
    meaning: "Repairing what is broken, ancestral healing.",
    judgment: "Work on what has been spoiled has supreme success. It furthers one to cross the great water.",
    image: "The wind blows low on the mountain: the image of Decay. Thus the superior man stirs up the people and strengthens their spirit."
  },
  { 
    number: 19, 
    binary: "110000", 
    name: "Approach", 
    chineseName: "Lín", 
    meaning: "Advancement, spring, supervision.",
    judgment: "Approach has supreme success. Perseverance furthers. When the eighth month comes, there will be misfortune.",
    image: "The earth above the lake: the image of Approach. Thus the superior man is inexhaustible in his will to teach, and without limits in his tolerance and protection of the people."
  },
  { 
    number: 20, 
    binary: "000011", 
    name: "Contemplation", 
    chineseName: "Guān", 
    meaning: "Observation, perspective, the view from above.",
    judgment: "Contemplation. The ablution has been made, but not yet the offering. Full of trust they look up to him.",
    image: "The wind blows over the earth: the image of Contemplation. Thus the kings of old visited the regions of the world, contemplated the people, and gave them instruction."
  },
  { 
    number: 21, 
    binary: "100101", 
    name: "Biting Through", 
    chineseName: "Shì Kè", 
    meaning: "Justice, removing obstacles, decisive action.",
    judgment: "Biting Through has success. It furthers one to let justice be administered.",
    image: "Thunder and lightning: the image of Biting Through. Thus the kings of former times made firm the laws through clearly defined penalties."
  },
  { 
    number: 22, 
    binary: "101001", 
    name: "Grace", 
    chineseName: "Bì", 
    meaning: "Beauty, aesthetics, superficial vs essential.",
    judgment: "Grace has success. In small matters it furthers one to undertake something.",
    image: "Fire at the foot of the mountain: the image of Grace. Thus the superior man throws light upon current affairs, but he does not venture to decide important questions of law in this way."
  },
  { 
    number: 23, 
    binary: "000001", 
    name: "Splitting Apart", 
    chineseName: "Bō", 
    meaning: "Deterioration, collapse, the need to wait.",
    judgment: "Splitting Apart. It does not further one to go anywhere.",
    image: "The mountain rests on the earth: the image of Splitting Apart. Thus those above can ensure their position only by giving generously to those below."
  },
  { 
    number: 24, 
    binary: "100000", 
    name: "Return", 
    chineseName: "Fù", 
    meaning: "Turning point, renewal, the return of light.",
    judgment: "Return. Success. Going out and coming in without error. Friends come without blame.",
    image: "Thunder within the earth: the image of the Turning Point. Thus the kings of antiquity closed the passes at the time of solstice."
  },
  { 
    number: 25, 
    binary: "100111", 
    name: "Innocence", 
    chineseName: "Wú Wàng", 
    meaning: "Spontaneity, unexpected events, sincerity.",
    judgment: "Innocence. Supreme success. Perseverance furthers. If someone is not as he should be, he has misfortune.",
    image: "Under heaven thunder rolls: all things attain the natural state of innocence. Thus the kings of old, rich in virtue, and in harmony with the time, fostered and nourished all beings."
  },
  { 
    number: 26, 
    binary: "111001", 
    name: "Great Taming", 
    chineseName: "Dà Chù", 
    meaning: "Accumulating power, restraint, firm character.",
    judgment: "The Taming Power of the Great. Perseverance furthers. Not eating at home brings good fortune.",
    image: "Heaven within the mountain: the image of the Taming Power of the Great. Thus the superior man acquaints himself with many sayings of antiquity and many deeds of the past."
  },
  { 
    number: 27, 
    binary: "100001", 
    name: "Nourishment", 
    chineseName: "Yí", 
    meaning: "Self-care, what we consume and what we say.",
    judgment: "The Corners of the Mouth. Perseverance brings good fortune. Pay heed to the providing of nourishment and to what a man seeks to fill his own mouth with.",
    image: "At the foot of the mountain, thunder: the image of Providing Nourishment. Thus the superior man is careful of his words and temperate in eating and drinking."
  },
  { 
    number: 28, 
    binary: "011110", 
    name: "Great Preponderance", 
    chineseName: "Dà Guò", 
    meaning: "Excessive weight, critical moment, inner strength.",
    judgment: "Preponderance of the Great. The ridgepole sags to the breaking point. It furthers one to have somewhere to go. Success.",
    image: "The lake rises above the trees: the image of Preponderance of the Great. Thus the superior man, when he stands alone, is unconcerned, and if he has to renounce the world, he is undaunted."
  },
  { 
    number: 29, 
    binary: "010010", 
    name: "The Abysmal", 
    chineseName: "Kǎn", 
    meaning: "Water, danger, repetition, flowing through.",
    judgment: "The Abysmal repeated. If you are sincere, you have success in your heart, and whatever you do succeeds.",
    image: "Water flows on uninterruptedly and reaches its goal: the image of the Abysmal repeated. Thus the superior man walks in lasting virtue and carries on the business of teaching."
  },
  { 
    number: 30, 
    binary: "101101", 
    name: "The Clinging", 
    chineseName: "Lí", 
    meaning: "Fire, clarity, dependence, brightness.",
    judgment: "The Clinging. Perseverance furthers. It brings success. Care of the cow brings good fortune.",
    image: "That which is bright rises twice: the image of Fire. Thus the great man, by perpetuating this brightness, illumines the four quarters of the world."
  },
  { 
    number: 31, 
    binary: "001110", 
    name: "Influence", 
    chineseName: "Xián", 
    meaning: "Attraction, courtship, mutual resonance.",
    judgment: "Influence. Success. Perseverance furthers. To take a maiden to wife brings good fortune.",
    image: "A lake on the mountain: the image of Influence. Thus the superior man encourages people to approach him by his readiness to receive them."
  },
  { 
    number: 32, 
    binary: "011100", 
    name: "Duration", 
    chineseName: "Héng", 
    meaning: "Constancy, endurance, long-term commitment.",
    judgment: "Duration. Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.",
    image: "Thunder and wind: the image of Duration. Thus the superior man stands firm and does not change his direction."
  },
  { 
    number: 33, 
    binary: "001111", 
    name: "Retreat", 
    chineseName: "Dùn", 
    meaning: "Strategic withdrawal, preserving strength.",
    judgment: "Retreat. Success. In what is small, perseverance furthers.",
    image: "Mountain under heaven: the image of Retreat. Thus the superior man keeps the inferior man at a distance, not with anger but with reserve."
  },
  { 
    number: 34, 
    binary: "111100", 
    name: "Great Power", 
    chineseName: "Dà Zhuàng", 
    meaning: "Strength, vigor, the need for restraint.",
    judgment: "The Power of the Great. Perseverance furthers.",
    image: "Thunder in heaven above: the image of the Power of the Great. Thus the superior man does not tread upon paths that do not accord with established order."
  },
  { 
    number: 35, 
    binary: "000101", 
    name: "Progress", 
    chineseName: "Jìn", 
    meaning: "Advancement, clarity, being recognized.",
    judgment: "Progress. The powerful prince is honored with horses in large numbers. In a single day he is granted audience three times.",
    image: "The sun rises over the earth: the image of Progress. Thus the superior man himself brightens his bright virtue."
  },
  { 
    number: 36, 
    binary: "101000", 
    name: "Darkening of the Light", 
    chineseName: "Míng Yí", 
    meaning: "Suppression, adversity, inner light.",
    judgment: "Darkening of the Light. In adversity it furthers one to be persevering.",
    image: "The sun has sunk under the earth: the image of Darkening of the Light. Thus the superior man lives with the great mass, but he veils his light."
  },
  { 
    number: 37, 
    binary: "101011", 
    name: "The Family", 
    chineseName: "Jiā Rén", 
    meaning: "Roles, order, internal harmony.",
    judgment: "The Family. The perseverance of the woman furthers.",
    image: "Wind comes forth from fire: the image of the Family. Thus the superior man has substance in his words and duration in his way of life."
  },
  { 
    number: 38, 
    binary: "110101", 
    name: "Opposition", 
    chineseName: "Kuí", 
    meaning: "Contrast, misunderstanding, small success.",
    judgment: "Opposition. In small matters, good fortune.",
    image: "Above, fire; below, the lake: the image of Opposition. Thus amid all points of similarity, the superior man retains his individuality."
  },
  { 
    number: 39, 
    binary: "001010", 
    name: "Obstruction", 
    chineseName: "Jiǎn", 
    meaning: "Difficulty, the need to turn back and seek help.",
    judgment: "Obstruction. The southwest furthers. The northeast does not further. It furthers one to see the great man. Perseverance brings good fortune.",
    image: "Water on the mountain: the image of Obstruction. Thus the superior man turns his attention to himself and molds his character."
  },
  { 
    number: 40, 
    binary: "010100", 
    name: "Deliverance", 
    chineseName: "Xiè", 
    meaning: "Release, forgiveness, moving forward.",
    judgment: "Deliverance. The southwest furthers. If there is no longer anything where one has to go, return brings good fortune.",
    image: "Thunder and rain set in: the image of Deliverance. Thus the superior man pardons mistakes and forgives misdeeds."
  },
  { 
    number: 41, 
    binary: "110001", 
    name: "Decrease", 
    chineseName: "Sǔn", 
    meaning: "Simplification, letting go, sincerity.",
    judgment: "Decrease combined with sincerity brings about supreme good fortune without blame. One may be persevering in this. It furthers one to undertake something.",
    image: "At the foot of the mountain, the lake: the image of Decrease. Thus the superior man controls his anger and restrains his instincts."
  },
  { 
    number: 42, 
    binary: "100011", 
    name: "Increase", 
    chineseName: "Yì", 
    meaning: "Expansion, benefit, helping others.",
    judgment: "Increase. It furthers one to undertake something. It furthers one to cross the great water.",
    image: "Wind and thunder: the image of Increase. Thus the superior man: if he sees good, he imitates it; if he has faults, he furthers himself of them."
  },
  { 
    number: 43, 
    binary: "111110", 
    name: "Breakthrough", 
    chineseName: "Guài", 
    meaning: "Resolution, decisiveness, removing evil.",
    judgment: "Breakthrough. One must resolutely make the matter known at the court of the king. It must be announced truthfully. Danger.",
    image: "The lake has risen up to heaven: the image of Breakthrough. Thus the superior man dispenses riches downward and refrains from resting on his virtue."
  },
  { 
    number: 44, 
    binary: "011111", 
    name: "Coming to Meet", 
    chineseName: "Gòu", 
    meaning: "Encounter, temptation, sudden influence.",
    judgment: "Coming to Meet. The maiden is powerful. One should not marry such a maiden.",
    image: "Under heaven, wind: the image of Coming to Meet. Thus does the ruler publish his commands and proclaim them to the four quarters of the earth."
  },
  { 
    number: 45, 
    binary: "000110", 
    name: "Gathering Together", 
    chineseName: "Cuì", 
    meaning: "Collection, massing, shared vision.",
    judgment: "Gathering Together. Success. The king approaches his temple. It furthers one to see the great man. This brings success.",
    image: "Over the earth, the lake: the image of Gathering Together. Thus the superior man renews his weapons in order to meet the unforeseen."
  },
  { 
    number: 46, 
    binary: "011000", 
    name: "Pushing Upward", 
    chineseName: "Shēng", 
    meaning: "Effort, growth, ascending step by step.",
    judgment: "Pushing Upward has supreme success. One must see the great man. Fear not. Departure toward the south brings good fortune.",
    image: "Within the earth, wood grows: the image of Pushing Upward. Thus the superior man of devoted character heaps up small things in order to achieve something high and great."
  },
  { 
    number: 47, 
    binary: "010110", 
    name: "Oppression", 
    chineseName: "Kùn", 
    meaning: "Exhaustion, trial, inner truth.",
    judgment: "Oppression. Success. Perseverance. The great man brings about good fortune. No blame. When one has something to say, it is not believed.",
    image: "There is no water in the lake: the image of Exhaustion. Thus the superior man stakes his life on following his will."
  },
  { 
    number: 48, 
    binary: "011010", 
    name: "The Well", 
    chineseName: "Jǐng", 
    meaning: "Source, sustenance, unchangeable depth.",
    judgment: "The Well. The town may be changed, but the well cannot be changed. It neither decreases nor increases. They come and go and draw from the well.",
    image: "Water over wood: the image of the Well. Thus the superior man encourages the people at their work, and exhorts them to help one another."
  },
  { 
    number: 49, 
    binary: "101110", 
    name: "Revolution", 
    chineseName: "Gé", 
    meaning: "Change, shedding the old, timing.",
    judgment: "Revolution. On your own day you are believed. Supreme success, furthering through perseverance. Remorse disappears.",
    image: "Fire in the lake: the image of Revolution. Thus the superior man sets the calendar in order and makes the seasons clear."
  },
  { 
    number: 50, 
    binary: "011101", 
    name: "The Caldron", 
    chineseName: "Dǐng", 
    meaning: "Transformation, spiritual nourishment, destiny.",
    judgment: "The Caldron. Supreme good fortune. Success.",
    image: "Fire over wood: the image of the Caldron. Thus the superior man consolidates his fate by making his position correct."
  },
  { 
    number: 51, 
    binary: "100100", 
    name: "The Arousing", 
    chineseName: "Zhèn", 
    meaning: "Thunder, shock, awakening, fear and trembling.",
    judgment: "Shock brings success. Shock comes—oh, oh! Laughing words—ha, ha! The shock terrifies for a hundred miles, and he does not let fall the sacrificial spoon and chalice.",
    image: "Thunder repeated: the image of Shock. Thus the superior man, under the influence of fear and trembling, sets his life in order and examines himself."
  },
  { 
    number: 52, 
    binary: "001001", 
    name: "Keeping Still", 
    chineseName: "Gèn", 
    meaning: "Mountain, meditation, stopping at the right time.",
    judgment: "Keeping Still. Keeping his back still so that he no longer feels his body. He goes into his courtyard and does not see his people. No blame.",
    image: "Mountains standing close together: the image of Keeping Still. Thus the superior man does not permit his thoughts to go beyond his situation."
  },
  { 
    number: 53, 
    binary: "001011", 
    name: "Development", 
    chineseName: "Jiàn", 
    meaning: "Gradual progress, marriage, patience.",
    judgment: "Development. The maiden is given in marriage. Good fortune. Perseverance furthers.",
    image: "On the mountain, a tree: the image of Development. Thus the superior man abides in dignity and virtue, in order to improve the customs."
  },
  { 
    number: 54, 
    binary: "110100", 
    name: "The Marrying Maiden", 
    chineseName: "Guī Mèi", 
    meaning: "Subordinate position, caution in relationships.",
    judgment: "The Marrying Maiden. Undertakings bring misfortune. Nothing that would further.",
    image: "Thunder over the lake: the image of the Marrying Maiden. Thus the superior man understands the transitory in the light of the eternity of the end."
  },
  { 
    number: 55, 
    binary: "101100", 
    name: "Abundance", 
    chineseName: "Fēng", 
    meaning: "Peak, greatness, the need to share.",
    judgment: "Abundance has success. The king attains abundance. Be not sad. Be like the sun at midday.",
    image: "Both thunder and lightning come: the image of Abundance. Thus the superior man decides lawsuits and carries out punishments."
  },
  { 
    number: 56, 
    binary: "001101", 
    name: "The Wanderer", 
    chineseName: "Lǚ", 
    meaning: "Travel, detachment, being a stranger.",
    judgment: "The Wanderer. Success through smallness. Perseverance brings good fortune to the wanderer.",
    image: "Fire on the mountain: the image of the Wanderer. Thus the superior man is clear-minded and cautious in imposing penalties, and protracts no lawsuits."
  },
  { 
    number: 57, 
    binary: "011011", 
    name: "The Gentle", 
    chineseName: "Xùn", 
    meaning: "Wind, wood, penetration, subtle influence.",
    judgment: "The Gentle. Success through what is small. It furthers one to have somewhere to go. It furthers one to see the great man.",
    image: "Winds following one upon another: the image of the Gently Penetrating. Thus the superior man spreads his commands abroad and carries out his undertakings."
  },
  { 
    number: 58, 
    binary: "110110", 
    name: "The Joyous", 
    chineseName: "Duì", 
    meaning: "Lake, pleasure, communication, shared joy.",
    judgment: "The Joyous. Success. Perseverance furthers.",
    image: "Lakes resting one on the other: the image of the Joyous. Thus the superior man joins with his friends for discussion and practice."
  },
  { 
    number: 59, 
    binary: "010011", 
    name: "Dispersion", 
    chineseName: "Huàn", 
    meaning: "Dissolving, clearing obstacles, unity.",
    judgment: "Dispersion. Success. The king approaches his temple. It furthers one to cross the great water. Perseverance furthers.",
    image: "The wind drives over the water: the image of Dispersion. Thus the kings of old sacrificed to the Lord and built temples."
  },
  { 
    number: 60, 
    binary: "110010", 
    name: "Limitation", 
    chineseName: "Jié", 
    meaning: "Boundaries, discipline, economy.",
    judgment: "Limitation. Success. Galling limitation must not be persevered in.",
    image: "Water over lake: the image of Limitation. Thus the superior man creates number and measure, and examines the nature of virtue and correct conduct."
  },
  { 
    number: 61, 
    binary: "110011", 
    name: "Inner Truth", 
    chineseName: "Zhōng Fú", 
    meaning: "Sincerity, empathy, influence over others.",
    judgment: "Inner Truth. Pigs and fishes. Good fortune. It furthers one to cross the great water. Perseverance furthers.",
    image: "Wind over lake: the image of Inner Truth. Thus the superior man discusses criminal cases in order to delay executions."
  },
  { 
    number: 62, 
    binary: "001100", 
    name: "Small Preponderance", 
    chineseName: "Xiǎo Guò", 
    meaning: "Attention to detail, modest goals.",
    judgment: "Preponderance of the Small. Success. Perseverance furthers. Small things may be done; great things should not be done.",
    image: "Thunder on the mountain: the image of Preponderance of the Small. Thus in his conduct the superior man gives precedence to reverence."
  },
  { 
    number: 63, 
    binary: "101010", 
    name: "After Completion", 
    chineseName: "Jì Jì", 
    meaning: "Order, balance, the need for vigilance.",
    judgment: "After Completion. Success in small matters. Perseverance furthers. At the beginning good fortune, at the end disorder.",
    image: "Water over fire: the image of After Completion. Thus the superior man takes thought of misfortune and arms himself against it in advance."
  },
  { 
    number: 64, 
    binary: "010101", 
    name: "Before Completion", 
    chineseName: "Wèi Jì", 
    meaning: "Transition, hope, the cycle beginning again.",
    judgment: "Before Completion. Success. But if the little fox, after nearly completing the crossing, gets his tail in the water, there is nothing that would further.",
    image: "Fire over water: the image of Before Completion. Thus the superior man is careful in the differentiation of things, so that each finds its place."
  }
];

export const getHexagramByBinary = (binary: string): Hexagram | undefined => {
  return HEXAGRAMS.find(h => h.binary === binary);
};

