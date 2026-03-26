export interface TarotCard {
    name: string;
    numeral: string;
    meaning_upright: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
    { "name": "The Fool", "numeral": "0", "meaning_upright": "New beginnings, innocence, spontaneity, a free spirit" },
    { "name": "The Magician", "numeral": "I", "meaning_upright": "Manifestation, resourcefulness, power, inspired action" },
    { "name": "The High Priestess", "numeral": "II", "meaning_upright": "Intuition, sacred knowledge, divine feminine, the subconscious mind" },
    { "name": "The Empress", "numeral": "III", "meaning_upright": "Femininity, beauty, nature, nurturing, abundance" },
    { "name": "The Emperor", "numeral": "IV", "meaning_upright": "Authority, establishment, structure, a father figure" },
    { "name": "The Hierophant", "numeral": "V", "meaning_upright": "Spiritual wisdom, religious beliefs, conformity, tradition, institutions" },
    { "name": "The Lovers", "numeral": "VI", "meaning_upright": "Love, harmony, relationships, values alignment, choices" },
    { "name": "The Chariot", "numeral": "VII", "meaning_upright": "Control, willpower, success, action, determination" },
    { "name": "Strength", "numeral": "VIII", "meaning_upright": "Strength, courage, persuasion, influence, compassion" },
    { "name": "The Hermit", "numeral": "IX", "meaning_upright": "Soul-searching, introspection, being alone, inner guidance" },
    { "name": "Wheel of Fortune", "numeral": "X", "meaning_upright": "Good luck, karma, life cycles, destiny, a turning point" },
    { "name": "Justice", "numeral": "XI", "meaning_upright": "Justice, fairness, truth, cause and effect, law" },
    { "name": "The Hanged Man", "numeral": "XII", "meaning_upright": "Pause, surrender, letting go, new perspectives" },
    { "name": "Death", "numeral": "XIII", "meaning_upright": "Endings, change, transformation, transition" },
    { "name": "Temperance", "numeral": "XIV", "meaning_upright": "Balance, moderation, patience, purpose" },
    { "name": "The Devil", "numeral": "XV", "meaning_upright": "Shadow self, attachment, addiction, restriction, sexuality" },
    { "name": "The Tower", "numeral": "XVI", "meaning_upright": "Sudden change, upheaval, chaos, revelation, awakening" },
    { "name": "The Star", "numeral": "XVII", "meaning_upright": "Hope, faith, purpose, renewal, spirituality" },
    { "name": "The Moon", "numeral": "XVIII", "meaning_upright": "Illusion, fear, anxiety, subconscious, intuition" },
    { "name": "The Sun", "numeral": "XIX", "meaning_upright": "Positivity, fun, warmth, success, vitality" },
    { "name": "Judgement", "numeral": "XX", "meaning_upright": "Judgement, rebirth, inner calling, absolution" },
    { "name": "The World", "numeral": "XXI", "meaning_upright": "Completion, integration, accomplishment, travel" },
];
