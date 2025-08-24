package main

import (
	"fmt"
	"github.com/rivo/uniseg"
)

func main() {
	// Test cases covering fundamental grapheme cluster counting
	testCases := []string{
		"Hello",            // Simple ASCII
		"🇩🇪🏳️‍🌈",          // Complex emoji sequences
		"नमस्ते",            // Devanagari script with combining characters
		"🧑‍💻",             // Professional emoji with ZWJ
		"a̧",               // Letter with combining mark
		"",                 // Empty string
		"🏴‍☠️",             // Pirate flag (complex ZWJ sequence)
		"👨‍👩‍👧‍👦",          // Family emoji
		"e̊̇",               // Multiple combining marks
		"각",               // Hangul precomposed
		"각",            // Hangul Jamo sequence
	}

	for _, test := range testCases {
		count := uniseg.GraphemeClusterCount(test)
		fmt.Println(count)
	}
}