package main

import (
	"fmt"
	"github.com/rivo/uniseg"
)

func main() {
	testCases := []string{
		"👩‍❤️‍👩", // Woman-heart-woman
		"🐻‍❄️",     // Polar bear  
		"❤️‍🔥",     // Heart on fire
		"👨🏽‍💻",   // Man technologist: medium skin tone
	}

	for _, test := range testCases {
		count := uniseg.GraphemeClusterCount(test)
		
		// Get segments
		g := uniseg.NewGraphemes(test)
		var segments []string
		for g.Next() {
			segment := g.Str()
			width := g.Width()
			segments = append(segments, fmt.Sprintf("[%s:%d]", segment, width))
		}
		
		fmt.Printf("%d:%s\n", count, test)
		for _, segment := range segments {
			fmt.Print(segment)
		}
		fmt.Println()
	}
}