package main

import (
	"fmt"
	"github.com/rivo/uniseg"
)

func main() {
	// Complex emoji and ZWJ sequences
	testCases := []string{
		"👨‍👩‍👧‍👦",         // Family: man, woman, girl, boy
		"🏳️‍🌈",              // Rainbow flag
		"🏳️‍⚧️",              // Transgender flag
		"👨🏽‍💻",            // Man technologist: medium skin tone
		"🧑‍🎓",              // Person student (gender-neutral)
		"👩‍❤️‍👩",           // Woman-heart-woman
		"🐻‍❄️",              // Polar bear
		"😮‍💨",              // Face exhaling
		"❤️‍🔥",             // Heart on fire
		"👁️‍🗨️",             // Eye in speech bubble
		"🏴‍☠️",              // Pirate flag
		"🧑🏻‍🦰",            // Person: light skin tone, red hair
		"👩🏾‍🚀",            // Woman astronaut: medium-dark skin tone
		"🤵🏿‍♀️",            // Woman in tuxedo: dark skin tone
		"🧑‍🤝‍🧑",           // People holding hands
		"👨‍👨‍👦‍👦",         // Family: man, man, boy, boy
	}

	for _, test := range testCases {
		count := uniseg.GraphemeClusterCount(test)
		width := uniseg.StringWidth(test)
		fmt.Printf("%d:%d\n", count, width)
		
		// Detailed breakdown
		state := -1
		remaining := test
		segments := []string{}
		
		for len(remaining) > 0 {
			cluster, rest, w, newState := uniseg.FirstGraphemeClusterInString(remaining, state)
			if cluster == "" {
				break
			}
			segments = append(segments, fmt.Sprintf("[%s:%d]", cluster, w))
			remaining = rest
			state = newState
		}
		
		for _, segment := range segments {
			fmt.Print(segment)
		}
		fmt.Println()
	}
}