package main

import (
	"fmt"
	"github.com/rivo/uniseg"
)

func main() {
	// Test cases for word boundary detection
	testCases := []string{
		"Hello, world!",
		"Test 123. More text!",
		"こんにちは世界",       // Japanese
		"Hello\nWorld",
		"word-with-hyphens",
		"CamelCaseWord",
		"user@example.com",
		"U.S.A.",
		"",
		"   ",
		"a",
		"café naïve résumé",   // Accented characters
	}

	for _, test := range testCases {
		state := -1
		var word string
		remaining := test
		result := []string{}
		
		for len(remaining) > 0 {
			word, remaining, state = uniseg.FirstWordInString(remaining, state)
			if word == "" {
				break
			}
			result = append(result, word)
		}
		
		fmt.Printf("%d\n", len(result))
		for _, w := range result {
			if w == " " {
				fmt.Print("(SPACE)")
			} else if w == "\n" {
				fmt.Print("(LF)")
			} else if w == "\t" {
				fmt.Print("(TAB)")
			} else {
				fmt.Printf("(%s)", w)
			}
		}
		fmt.Println()
	}
}