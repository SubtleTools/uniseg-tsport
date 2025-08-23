package main

import (
	"fmt"
	"github.com/rivo/uniseg"
)

func main() {
	// Basic grapheme cluster count tests
	testCases := []string{
		"Hello",                    // Simple ASCII
		"🇩🇪🏳️‍🌈",                  // Complex emoji sequences 
		"नमस्ते",                   // Devanagari script
		"🧑‍💻",                     // Profession emoji with ZWJ
		"a̧",                       // Letter with combining mark
		"",                        // Empty string
	}
	
	for _, testCase := range testCases {
		count := uniseg.GraphemeClusterCount(testCase)
		fmt.Printf("%d\n", count)
	}
}