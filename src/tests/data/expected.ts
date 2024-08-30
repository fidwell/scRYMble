import ScrobbleRecord from "../../models/ScrobbleRecord";
import TestModel from "../models/TestModel";

export const headOnTheDoor: TestModel = {
  artist: "The Cure",
  album: "The Head on the Door",
  tracks: [
    {
      artist: "The Cure",
      trackName: "In Between Days",
      duration: 2 * 60 + 55
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "Kyoto Song",
      duration: 4 * 60
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "The Blood",
      duration: 3 * 60 + 42
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "Six Different Ways",
      duration: 3 * 60 + 16
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "Push",
      duration: 4 * 60 + 28
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "The Baby Screams",
      duration: 3 * 60 + 43
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "Close to Me",
      duration: 3 * 60 + 23
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "A Night Like This",
      duration: 4 * 60 + 12
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "Screw",
      duration: 2 * 60 + 35
    } as ScrobbleRecord,
    {
      artist: "The Cure",
      trackName: "Sinking",
      duration: 4 * 60 + 50
    } as ScrobbleRecord
  ]
};

export const split: TestModel = {
  artist: "Prosanctus Inferi / Witch Tomb",
  album: "Prosanctus Inferi / Witch Tomb",
  tracks: [
    {
      artist: "Prosanctus Inferi",
      trackName: "Burning Vestal Apocrypha",
      duration: 180
    } as ScrobbleRecord,
    {
      artist: "Prosanctus Inferi",
      trackName: "Benedictine Palpitations",
      duration: 180
    } as ScrobbleRecord,
    {
      artist: "Prosanctus Inferi",
      trackName: "Spoiling Sacred Benefactor",
      duration: 180
    } as ScrobbleRecord,
    {
      artist: "Witch Tomb",
      trackName: "Intro",
      duration: 180
    } as ScrobbleRecord,
    {
      artist: "Witch Tomb",
      trackName: "Burnt Altar",
      duration: 180
    } as ScrobbleRecord,
    {
      artist: "Witch Tomb",
      trackName: "Second Cumming",
      duration: 180
    } as ScrobbleRecord,
    {
      artist: "Witch Tomb",
      trackName: "Descend",
      duration: 180
    } as ScrobbleRecord,
  ]
};

export const braidWithLinks: TestModel = {
  artist: "Jami Sieber",
  album: "Music From Braid",
  tracks: [
    {
      artist: "Jami Sieber",
      trackName: "Maenam",
      duration: 5 * 60 + 39
    } as ScrobbleRecord,
    {
      artist: "Shira Kammen",
      trackName: "Downstream",
      duration: 6 * 60 + 37
    } as ScrobbleRecord,
    {
      artist: "Shira Kammen & Pam Swan",
      trackName: "Lullaby Set",
      duration: 6 * 60 + 18
    } as ScrobbleRecord,
    {
      artist: "Cheryl Ann Fulton",
      trackName: "Romanesca",
      duration: 2 * 60 + 31
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Long Past Gone",
      duration: 4 * 60 + 45
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "The Darkening Ground",
      duration: 3 * 60 + 13
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Undercurrent",
      duration: 5 * 60 + 34
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Tell It by Heart",
      duration: 5 * 60 + 50
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Maenam",
      duration: 7 * 60 + 5
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Undercurrent",
      duration: 4 * 60 + 55
    } as ScrobbleRecord
  ]
};

export const braidWithoutLinks: TestModel = {
  artist: "Jami Sieber",
  album: "Music From Braid",
  tracks: [
    {
      artist: "Jami Sieber",
      trackName: "Maenam",
      duration: 5 * 60 + 39
    } as ScrobbleRecord,
    {
      artist: "Shira Kammen",
      trackName: "Downstream",
      duration: 6 * 60 + 36
    } as ScrobbleRecord,
    {
      artist: "Shira Kammen & Pam Swan",
      trackName: "Lullaby Set",
      duration: 6 * 60 + 18
    } as ScrobbleRecord,
    {
      artist: "Cheryl Ann Fulton",
      trackName: "Romanesca",
      duration: 2 * 60 + 31
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Long Past Gone",
      duration: 4 * 60 + 44
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "The Darkening Ground",
      duration: 3 * 60 + 12
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Undercurrent",
      duration: 5 * 60 + 34
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Tell It by Heart",
      duration: 5 * 60 + 50
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Maenam (Jon Schatz remix)",
      duration: 7 * 60 + 5
    } as ScrobbleRecord,
    {
      artist: "Jami Sieber",
      trackName: "Undercurrent (Jon Schatz remix)",
      duration: 4 * 60 + 54
    } as ScrobbleRecord
  ]
};

export const dieMenschMaschine: TestModel = {
  artist: "Kraftwerk",
  album: "Die Mensch-Maschine",
  tracks: [
    {
      artist: "Kraftwerk",
      trackName: "Die Roboter",
      duration: 6 * 60 + 9
    } as ScrobbleRecord,
    {
      artist: "Kraftwerk",
      trackName: "Spacelab",
      duration: 5 * 60 + 56
    } as ScrobbleRecord,
    {
      artist: "Kraftwerk",
      trackName: "Metropolis",
      duration: 5 * 60 + 59
    } as ScrobbleRecord,
    {
      artist: "Kraftwerk",
      trackName: "Das Model",
      duration: 3 * 60 + 39
    } as ScrobbleRecord,
    {
      artist: "Kraftwerk",
      trackName: "Neonlicht",
      duration: 9 * 60 + 5
    } as ScrobbleRecord,
    {
      artist: "Kraftwerk",
      trackName: "Die Mensch-Maschine",
      duration: 5 * 60 + 25
    } as ScrobbleRecord
  ]
};

export const sinkingOfTheTitanic: TestModel = {
  artist: "Gavin Bryars",
  album: "The Sinking of the Titanic",
  tracks: [
    {
      artist: "Gavin Bryars",
      trackName: "The Sinking of the Titanic",
      duration: 3 * 60
    } as ScrobbleRecord,
    {
      artist: "Gavin Bryars",
      trackName: "Jesus' Blood Never Failed Me Yet",
      duration: 3 * 60
    } as ScrobbleRecord
  ]
};

export const planets: TestModel = {
  artist: "Berliner Philharmoniker / Herbert von Karajan",
  album: "The Planets",
  tracks: [
    {
      artist: "Berliner Philharmoniker / Herbert von Karajan",
      trackName: "Mars, the Bringer of War",
      duration: 3 * 60
    } as ScrobbleRecord,
    {
      artist: "Berliner Philharmoniker / Herbert von Karajan",
      trackName: "Venus, the Bringer of Peace",
      duration: 3 * 60
    } as ScrobbleRecord,
    {
      artist: "Berliner Philharmoniker / Herbert von Karajan",
      trackName: "Mercury, the Winged Messenger",
      duration: 3 * 60
    } as ScrobbleRecord,
    {
      artist: "Berliner Philharmoniker / Herbert von Karajan",
      trackName: "Jupiter, the Bringer of Jollity",
      duration: 3 * 60
    } as ScrobbleRecord,
    {
      artist: "Berliner Philharmoniker / Herbert von Karajan",
      trackName: "Saturn, the Bringer of Old Age",
      duration: 3 * 60
    } as ScrobbleRecord,
    {
      artist: "Berliner Philharmoniker / Herbert von Karajan",
      trackName: "Uranus, the Magician",
      duration: 3 * 60
    } as ScrobbleRecord,
    {
      artist: "Berliner Philharmoniker / Herbert von Karajan",
      trackName: "Neptune, the Mystic",
      duration: 3 * 60
    } as ScrobbleRecord
  ]
}
