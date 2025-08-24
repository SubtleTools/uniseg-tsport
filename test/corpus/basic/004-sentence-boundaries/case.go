package main

import (
	"fmt"
	"github.com/rivo/uniseg"
)

func main() {
	// Test cases for sentence boundary detection
	testCases := []string{
		"This is sentence 1.0. And this is sentence two.",
		"Hello! How are you? I'm fine.",
		"Mr. Smith went to the U.S.A. yesterday.",
		"What?! No way... Really?",
		"End.\n\nNew paragraph.",
		"",
		"No punctuation here",
		"Multiple...   spaces!    After   punctuation.",
		"E.g. this is an example.",
		"Test (with parentheses). Next sentence.",
		"Question mark? Answer! Exclamation.",
		"Dr. Jones vs. Dr. Smith.",
	}

	for _, test := range testCases {
		state := -1
		var sentence string
		remaining := test
		result := []string{}
		
		for len(remaining) > 0 {
			sentence, remaining, state = uniseg.FirstSentenceInString(remaining, state)
			if sentence == "" {
				break
			}
			result = append(result, sentence)
		}
		
		fmt.Printf("%d\n", len(result))
		for i, s := range result {
			if i > 0 {
				fmt.Print("|")
			}
			fmt.Printf("(%s)", s)
		}
		fmt.Println()
	}
}