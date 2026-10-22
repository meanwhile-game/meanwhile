package passages

import (
	"math/rand"
	"meanwhile-server-go/internal/models"
)

var Passages = []models.Passage{
	// --- BOOKS ---
	{
		ID:         "book-gatsby",
		Title:      "The Great Gatsby",
		Author:     "F. Scott Fitzgerald",
		SourceType: models.SourceBook,
		Year:       1925,
		Category:   "Classic Literature",
		Difficulty: "medium",
		Context:    "From Chapter 9 of Fitzgerald’s 1925 masterpiece on ambition, memory, and the green light at the end of the dock.",
		Text:       "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther. And then one fine morning—so we beat on, boats against the current, borne back ceaselessly into the past.",
	},
	{
		ID:         "book-dune",
		Title:      "Dune",
		Author:     "Frank Herbert",
		SourceType: models.SourceBook,
		Year:       1965,
		Category:   "Science Fiction",
		Difficulty: "hard",
		Context:    "The Litany Against Fear recited by Paul Atreides and the Bene Gesserit to master composure under lethal pressure.",
		Text:       "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me. And when it has gone past I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain.",
	},
	{
		ID:         "book-racing-in-the-rain",
		Title:      "The Art of Racing in the Rain",
		Author:     "Garth Stein",
		SourceType: models.SourceBook,
		Year:       2008,
		Category:   "Motorsport Novel",
		Difficulty: "easy",
		Context:    "Denny Swift’s guiding philosophy on racecraft and mental focus behind the wheel in wet conditions.",
		Text:       "There is no dishonor in losing the race. There is only dishonor in not racing because you are afraid to lose. That which you manifest is before you; we are the creators of our own destiny. The car goes where the eyes go.",
	},
	{
		ID:         "book-neuromancer",
		Title:      "Neuromancer",
		Author:     "William Gibson",
		SourceType: models.SourceBook,
		Year:       1984,
		Category:   "Cyberpunk",
		Difficulty: "medium",
		Context:    "The iconic opening lines of Gibson’s seminal 1984 cyberpunk classic set in the neon shadows of Chiba City.",
		Text:       "The sky above the port was the color of television, tuned to a dead channel. It was not like I was using, Case heard someone say, as he shouldered his way through the crowd around the door of the Chatsubo. It was like my body had developed this massive drug deficiency.",
	},
	{
		ID:         "book-1984",
		Title:      "1984",
		Author:     "George Orwell",
		SourceType: models.SourceBook,
		Year:       1949,
		Category:   "Dystopian Fiction",
		Difficulty: "easy",
		Context:    "The unforgettable opening sentence of George Orwell’s vision of surveillance and totalitarian control.",
		Text:       "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
	},
	{
		ID:         "book-lotr-strider",
		Title:      "The Fellowship of the Ring",
		Author:     "J.R.R. Tolkien",
		SourceType: models.SourceBook,
		Year:       1954,
		Category:   "High Fantasy",
		Difficulty: "medium",
		Context:    "The Riddle of Strider from Gandalf’s letter to Frodo Baggins concerning the true heir of Isildur.",
		Text:       "All that is gold does not glitter, not all those who wander are lost; the old that is strong does not wither, deep roots are not reached by the frost. From the ashes a fire shall be woken, a light from the shadows shall spring; renewed shall be blade that was broken, the crownless again shall be king.",
	},
	{
		ID:         "book-fahrenheit-451",
		Title:      "Fahrenheit 451",
		Author:     "Ray Bradbury",
		SourceType: models.SourceBook,
		Year:       1953,
		Category:   "Speculative Fiction",
		Difficulty: "medium",
		Context:    "The provocative opening lines of Guy Montag’s journey as a fireman tasked with burning forbidden knowledge.",
		Text:       "It was a pleasure to burn. It was a special pleasure to see things eaten, to see things blackened and changed. With the brass nozzle in his fists, with this great python spitting its venomous kerosene upon the world, the blood pounded in his head, and his hands were the hands of some amazing conductor.",
	},

	// --- SONGS ---
	{
		ID:         "song-bohemian-rhapsody",
		Title:      "Bohemian Rhapsody",
		Author:     "Queen",
		SourceType: models.SourceSong,
		Year:       1975,
		Category:   "Classic Rock",
		Difficulty: "easy",
		Context:    "Written by Freddie Mercury for Queen’s 1975 multi-platinum album A Night at the Opera.",
		Text:       "Is this the real life? Is this just fantasy? Caught in a landslide, no escape from reality. Open your eyes, look up to the skies and see. I'm just a poor boy, I need no sympathy, because I'm easy come, easy go, little high, little low. Any way the wind blows doesn't really matter to me.",
	},
	{
		ID:         "song-space-oddity",
		Title:      "Space Oddity",
		Author:     "David Bowie",
		SourceType: models.SourceSong,
		Year:       1969,
		Category:   "Art Rock",
		Difficulty: "medium",
		Context:    "Released days before the Apollo 11 moon landing in July 1969, detailing the solitary journey of astronaut Major Tom.",
		Text:       "Ground Control to Major Tom, commencing countdown, engines on. Check ignition and may God's love be with you. This is Ground Control to Major Tom: you've really made the grade, and the papers want to know whose shirts you wear. Now it's time to leave the capsule if you dare.",
	},
	{
		ID:         "song-daft-punk",
		Title:      "Harder, Better, Faster, Stronger",
		Author:     "Daft Punk",
		SourceType: models.SourceSong,
		Year:       2001,
		Category:   "Electronic Dance",
		Difficulty: "easy",
		Context:    "The robotic, high-tempo vocal anthem from Daft Punk’s landmark album Discovery.",
		Text:       "Work it make it do it makes us harder better faster stronger more than ever hour after hour work is never over. Work it harder make it better do it faster makes us stronger, more than ever, hour after, our work is never over.",
	},
	{
		ID:         "song-fast-car",
		Title:      "Fast Car",
		Author:     "Tracy Chapman",
		SourceType: models.SourceSong,
		Year:       1988,
		Category:   "Folk Rock",
		Difficulty: "medium",
		Context:    "Grammy-winning narrative song about the hope of escape and velocity toward a new life.",
		Text:       "You got a fast car, I want a ticket to anywhere. Maybe we make a deal, maybe together we can get somewhere. Any place is better, starting from zero got nothing to lose. Maybe we'll make something, me, myself, I got nothing to prove.",
	},
	{
		ID:         "song-pink-floyd",
		Title:      "Comfortably Numb",
		Author:     "Pink Floyd",
		SourceType: models.SourceSong,
		Year:       1979,
		Category:   "Progressive Rock",
		Difficulty: "hard",
		Context:    "From Pink Floyd’s iconic rock opera The Wall, exploring isolation and sensory detachment.",
		Text:       "There is no pain you are receding, a distant ship smoke on the horizon. You are only coming through in waves, your lips move but I cannot hear what you are saying. When I was a child I had a fever, my hands felt just like two balloons. Now I've got that feeling once again.",
	},

	// --- ARTICLES, SPEECHES & ESSAYS ---
	{
		ID:         "speech-pale-blue-dot",
		Title:      "Pale Blue Dot",
		Author:     "Carl Sagan",
		SourceType: models.SourceSpeech,
		Year:       1994,
		Category:   "Cosmology & Philosophy",
		Difficulty: "hard",
		Context:    "Delivered by Carl Sagan at Cornell University, reflecting on the image of Earth taken by Voyager 1 from 3.7 billion miles away.",
		Text:       "Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines.",
	},
	{
		ID:         "speech-steve-jobs",
		Title:      "Stay Hungry, Stay Foolish",
		Author:     "Steve Jobs",
		SourceType: models.SourceSpeech,
		Year:       2005,
		Category:   "Stanford Commencement Address",
		Difficulty: "easy",
		Context:    "From Steve Jobs’s 2005 Stanford University address, reflecting on mortality, passion, and creative intuition.",
		Text:       "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking. Don't let the noise of others' opinions drown out your own inner voice. And most important, have the courage to follow your heart and intuition.",
	},
	{
		ID:         "essay-feynman",
		Title:      "The Pleasure of Finding Things Out",
		Author:     "Richard Feynman",
		SourceType: models.SourceEssay,
		Year:       1981,
		Category:   "Physics & Philosophy",
		Difficulty: "medium",
		Context:    "Nobel physicist Richard Feynman’s famous BBC interview on embracing curiosity and uncertainty over false certainty.",
		Text:       "I can live with doubt and uncertainty and not knowing. I think it's much more interesting to live not knowing than to have answers which might be wrong. I have approximate answers and possible beliefs and different degrees of certainty about different things, but I'm not absolutely sure of anything.",
	},
	{
		ID:         "article-cathedral-bazaar",
		Title:      "The Cathedral and the Bazaar",
		Author:     "Eric S. Raymond",
		SourceType: models.SourceArticle,
		Year:       1997,
		Category:   "Open Source Culture",
		Difficulty: "medium",
		Context:    "The revolutionary computing essay analyzing the decentralized, collaborative development of the Linux kernel.",
		Text:       "Given enough eyeballs, all bugs are shallow. Linus Torvalds's method of releasing early and often, delegating everything you could, and being open to the point of promiscuity came with the force of a surprise. No quiet, reverent cathedral-building here—rather, the Linux community seemed to resemble a great babbling bazaar.",
	},
	{
		ID:         "speech-jfk-moon",
		Title:      "We Choose to Go to the Moon",
		Author:     "John F. Kennedy",
		SourceType: models.SourceSpeech,
		Year:       1962,
		Category:   "Historical Address",
		Difficulty: "easy",
		Context:    "Delivered at Rice University Stadium on September 12, 1962, galvanizing the Apollo space program.",
		Text:       "We choose to go to the Moon. We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard, because that goal will serve to organize and measure the best of our energies and skills, because that challenge is one that we are willing to accept.",
	},
}

func GetRandomPassage(difficulty string) models.Passage {
	var filtered []models.Passage
	if difficulty != "" {
		for _, p := range Passages {
			if p.Difficulty == difficulty {
				filtered = append(filtered, p)
			}
		}
	}
	if len(filtered) == 0 {
		filtered = Passages
	}
	return filtered[rand.Intn(len(filtered))]
}
