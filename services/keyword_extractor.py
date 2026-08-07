import re

try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = None
except ImportError:
    spacy = None
    nlp = None

# Common words that don't help recommendations
STOP_WORDS = {
    "book",
    "story",
    "stories",
    "novel",
    "edition",
    "illustration",
    "illustrations",
    "drawing",
    "drawings",
    "afterword",
    "reader",
    "readers",
    "author",
    "authors",
    "case",
    "task",
    "tasks",
    "year",
    "way",
    "world",
    "time",
    "life",
    "day",
    "man",
    "woman",
    "boy",
    "girl",
    "people",
    "person",
    "child",
    "children"
}

# Only keep these entity types
ALLOWED_ENTITY_TYPES = {
    "PERSON",
    "ORG",
    "GPE",
    "LOC",
    "WORK_OF_ART",
    "EVENT",
    "PRODUCT"
}


def clean_keyword(keyword: str):
    keyword = keyword.lower().strip()
    keyword = re.sub(r"[^a-z0-9\s]", "", keyword)
    keyword = " ".join(keyword.split())
    return keyword


def clean_overview(text: str):

    if not text:
        return ""

    text = text.lower()

    REMOVE_PHRASES = [
        "this edition",
        "afterword",
        "illustrated by",
        "illustrations by",
        "original drawings",
        "suitable for",
        "this book",
        "includes",
        "includes an afterword",
        "with an afterword",
    ]

    for phrase in REMOVE_PHRASES:
        text = text.replace(phrase, " ")

    # Remove long numbers
    text = re.sub(r"\b\d+\b", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_keywords(title: str, overview: str, categories: str):

    overview = clean_overview(overview)

    text = f"{title}. {categories}. {overview}"

    keywords = []

    # Categories
    if categories:
        for category in categories.split(","):
            category = clean_keyword(category)

            if category:
                keywords.append(category)

    if nlp is not None:
        doc = nlp(text)

        # Named Entities
        entity_words = set()

        for ent in doc.ents:

            if ent.label_ not in ALLOWED_ENTITY_TYPES:
                continue

            keyword = clean_keyword(ent.text)

            if len(keyword) >= 4:
                keywords.append(keyword)

                for word in keyword.split():
                    entity_words.add(word)

        # Important nouns
        for token in doc:

            if token.pos_ not in {"NOUN", "PROPN"}:
                continue

            if token.dep_ not in {"nsubj", "dobj", "pobj", "ROOT"}:
                continue

            if token.is_stop or token.is_punct:
                continue

            keyword = clean_keyword(token.text)

            if len(keyword) < 4:
                continue

            if keyword in STOP_WORDS:
                continue

            if keyword in entity_words:
                continue

            keywords.append(keyword)
    else:
        # Fallback keyword extraction if spaCy is not available
        words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
        for w in words:
            if w not in STOP_WORDS:
                keywords.append(clean_keyword(w))

    # Remove duplicates while preserving order
    keywords = list(dict.fromkeys(keywords))

    return keywords

