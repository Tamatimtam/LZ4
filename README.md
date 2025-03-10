# 🚀 LZ4 Compression Visualizer 

## Hey there, fellow data enthusiasts! 👋

Ever wondered how your files magically shrink when you compress them? Or why your "AAAAAABBBBCCC" text somehow takes less space when zipped? Well, I did too, and that's why I built this interactive LZ4 compression visualizer!

Created by: **Pratama Varian Andika** - *2207421040*  
*Politeknik Negeri Jakarta*

![LZ4 Visualizer Screenshot](/static/images/image.png)

## What's This All About? 🤔

This app lets you **see** and **understand** how LZ4 compression works in real-time. Instead of just compressing data like a black box, it walks you through the entire process step-by-step with colorful visualizations and explanations that even your non-tech friends might understand!

## Why LZ4 Compression? 🧩

LZ4 is a super-fast compression algorithm that's used EVERYWHERE in computing - from file compression to memory optimization in games. It's like the cheetah of compression algorithms: not always the smallest result, but blazing fast! 

The cool thing is, once you understand how LZ4 works, you'll get the general idea behind lots of other compression algorithms too!

## Features That'll Blow Your Mind 🤯

- **Interactive Visualization**: Watch each step of compression happen right before your eyes
- **Step-by-Step Controls**: Play, pause, go forward or back through each compression decision
- **Match Analysis**: See exactly how the algorithm finds repeated patterns to save space
- **Size Comparison**: Real-time stats showing how much space you're saving
- **Educational Explanations**: Clear descriptions of what's happening at each step
- **Adjustable Speed**: Too fast? Too slow? You control the pace!

## How to Run This Bad Boy 🏃‍♂️

### Using Docker (the easiest way):

1. Make sure you have Docker installed (if not, Google "install Docker" - it's pretty simple!)
2. Open your terminal/command prompt
3. Navigate to the project folder
4. Run these commands:

```bash
# Build the Docker image
docker build -t lz4-visualizer .

# Run the container
docker run -p 8080:8080 lz4-visualizer
```

5. Open your browser and go to `http://localhost:8080`
6. Start compressing and be amazed! 🎉

### Running Locally (without Docker):

```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run the app
python app.py
```

## How to Use It 🎮

1. Type or paste some text in the input area (try something with repeating patterns like "ABCABCABCABC")
2. Click "Compress"
3. Watch the magic happen! You can:
   - Let it play automatically
   - Use the controls to step through manually
   - Adjust the speed with the slider
   - Reset and try different inputs

## The Science Behind the Magic ✨

Here's what's happening when you compress text:

1. **Window Scanning**: The algorithm looks at what it's already seen (the "window")
2. **Pattern Matching**: It finds the longest matching pattern between the current position and previous data
3. **Smart Encoding**: Instead of storing duplicate data, it just stores a reference (offset, length) to where it saw that pattern before
4. **Space Saving**: References often take less space than the full repeated data

For example, instead of storing "ABCABCABC", it might store "ABC(3,3)(3,3)" which means "ABC, then copy 3 characters starting from position 0, then do it again."

## Why I Made This 🎓

As a student at Politeknik Negeri Jakarta, I was trying to understand compression algorithms for my classes and found that most explanations were too abstract or math-heavy. I wanted something I could actually *see working*. So I built this tool to help myself and other students visualize what's going on under the hood!

## Technical Stuff (for the Curious) 🧪

The app is built with:
- **Flask**: A lightweight Python web framework
- **Vanilla JavaScript**: For the interactive visualizations (no heavy frameworks needed!)
- **Bootstrap**: For making it look pretty without me having to be a CSS wizard
- **Docker**: For easy deployment and sharing

The LZ4 implementation is a simplified educational version - real-world LZ4 has some additional optimizations, but the core concept is the same!

## Safety First! 🛡️

Since this is deployed online, I've added:
- Rate limiting (so nobody can crash our server by hammering it)
- Input validation (to catch shenanigans)
- Size restrictions (compression can be resource-intensive for huge inputs)

## Contribute or Steal This Code (I Mean, Get Inspired) 💡

Feel free to fork this project, improve it, or use it for your own learning! If you have cool ideas or find bugs, let me know. All I ask is that you keep the credits if you use substantial portions of the code.

## Final Thoughts 💭

Compression algorithms might seem like dark magic, but they're actually pretty intuitive once you see them in action. Hope this tool makes your journey into data compression a bit more fun and a lot less confusing!

Happy compressing! 🎈

---

*Created with ❤️ and a lot of caffeine by Pratama Varian Andika (2207421040), Politeknik Negeri Jakarta*

*© 2025 - But seriously, it's open source, so go wild with it*
