---
title: 'It did in a day what I couldn''t do in two years'
coverImage: '/assets/blog/i-couldnt-it-couldnt-and-then-both-could/chessvision-driving.png'
date: '2026-07-05T00:00:00.000Z'
author:
  name: Tomas Mažvila
  picture: '/assets/blog/authors/TomasMazvilaSatanProfile.png'
ogImage:
  url: '/assets/blog/i-couldnt-it-couldnt-and-then-both-could/chessvision-driving.png'
---

## The transcriber
A year ago I finished my bachelor's. It took nine years. Two of them went into one project: a chess-video transcriber. Point it at a recording of a game and it tells you the moves. 2D video in, moves out. I never built it the way I wanted. In the end I just made it work. Then a year later Fable 5 built the version I never could, while I slept.

The first problem was finding the chessboard inside a video frame, and OpenCV ships a function built for exactly that: `findChessboardCorners`. I tried it first. It didn't work.

![findChessboardCorners returning nothing on a screen-recorded board](/assets/blog/i-couldnt-it-couldnt-and-then-both-could/board-detection-fail.png)

So I did it by hand. Detect the horizontal and vertical lines with Hough lines, find where they cross, and pull out nine roughly evenly-spaced points along each axis (nine, because a board has nine lines) while ignoring the spurious lines the edge detector coughs up around the border, the clock, the player's hand. That's two sub-problems, and I gave both to ChatGPT. The first was the geometry: given the detected lines, find where they intersect. It handed me an algorithm that ignored division by zero, the exact case you hit the moment a line is perfectly vertical. So it fell over, and I worked out the intersections myself. The second was the spacing: a function that takes the noisy list of intersection coordinates and pulls out the runs that are evenly spaced, within a tolerance, because real pixels never land exactly evenly. I wrote the test first:

```python
find_consecutive_points([5, 10, 15, 17, 20, 24, 30], 5, threshold=2)
# expected: [[5, 10, 15, 20, 24], [10, 15, 20, 24, 30]]
```

Five, ten, fifteen (gap of five), then a 17 that's noise, then 20, 24, 30. Find the two windows of five points where the spacing holds within the tolerance, skip the 17. This was the free 3.5-era model everyone had. It struggled and struggled and produced nothing. So I gave it a second fully worked example to anchor it, and it came back confident. It wrote a function and walked me through it in cheerful prose. In the explanation, it told me it produced exactly the output I wanted:

```python
def find_equal_distance_points(points, consecutive_count, threshold):
    result = []
    for i in range(len(points) - consecutive_count + 1):
        window = points[i:i + consecutive_count]
        ok = True
        for j in range(len(window) - 1):
            if window[j + 1] - window[j] != threshold:   # equality, not tolerance
                ok = False
                break
        if ok:
            result.append(window)
    return result
```

Look at the inner check. It compared each raw gap against the threshold directly (`!= threshold`), which can't be right, because a tolerance is the slack around the spacing, and the code was comparing against the spacing itself. With a threshold of 2 and a real spacing of 5, every gap fails, so every window is rejected. But the prose above the code was so sure of itself, had even printed the correct output as if it had run it, that I ran it without really reading it first. The real result:

```
Example 1 Result: []
Example 2 Result: []
```

It told me, in words, that the answer was correct, and the code returned two empty lists. So I pushed it (the test is still red, make it pass), and this time it tried to write the passing code itself: generate a version, run it against the examples, fail, rewrite, run, fail, and go again, looping through its own attempts, failing and trying and failing and trying, until it crashed. I sent the same prompt to a friend who had gpt 4.0, and his ChatGPT gave back a better answer: instead of matching each gap to the threshold, it averaged the gaps across a window and checked whether each stayed close to that average. Better, but still wrong. It cleared the two toy examples, and for a second I was happy. Then I plugged it into the real detector, against real frames, and it fell apart, because the input there wasn't a clean handpicked list but the dirty output of the line-finder. I only got it right by working it out on paper myself.

That's the part I'm still a little proud of. Finding the board took an algorithm I built by hand. In 2023 the machine handed me confident empty lists, and I was the one who could make the thing actually run. I was better than a machine. That didn't last.

I did break down and buy ChatGPT 4.0 eventually, later in the project (the better model, the paid one). It was better. It got the small, clean problems right where 3.5 had face-planted. But it couldn't get me past the hard parts, and there I was still on my own.

With the board found and cut out, the next problem was identifying the pieces: which piece sits on each square, read straight from the frame.

I went looking for anyone who'd already done this, and found almost nothing. Every example I could dig up was for physical, 3D, over-the-board chess, a real board shot with a camera. The games I cared about were flat, 2D, and screen-recorded. The only source close to what I needed was one PDF laying out a neural-network architecture[^cs231n]. There was also a cheating tool for chess.com, the kind that watches a live game and feeds you the engine move, but it only worked on chess.com's own pieces, and I wanted mine to work anywhere: any site, any piece set, whatever video got thrown at it, lichess especially and not just chess.com.

Really it was just ego. I wanted it perfect, to prove to myself that I was able and smart, that I could build the ultimate tool. So I decided to train my own neural network to read the pieces, one that didn't care what the pieces looked like.

The pieces were where I actually got stuck. I generated and labeled my own training data and trained a convolutional net from scratch in PyTorch. It failed. I kept on facing an overfitting problem. I could not tell whether the data was wrong, or the architecture was wrong, or the whole approach was wrong.

![The CNN overfitting: a real board read as almost all knights](/assets/blog/i-couldnt-it-couldnt-and-then-both-could/cnn-overfitting.png)

I tried YOLOv8, thinking object detection would do it. That failed too. I went to my thesis defense that year anyway, with a half-built product that didn't run, and I failed. I had nothing to show. The one useful thing I got out of it was advice from the professors: forget the neural network, they said, and just match the pieces against stored templates with OpenCV. Then I set the project aside and waited for the next academic year.

When I came back a year later I tried to get the CNN working one more time and still couldn't. So I took the professors' advice from the failed defense and fell back to OpenCV template matching, and it just worked. For each of the 64 squares I correlated the tile against a stored image of each piece and took the best match. It took maybe half an hour. I fiddled with the threshold a few times until one stuck. It read the board. Only for one piece set, but that was enough. I was pointing it at a single video, so lighting and resolution never varied enough to matter. Template matching can't read a piece set it has no template for, and it would fall apart on a different site or theme. I just wanted to pass and be done. Just make it work, finally.

The last piece was reconstruction: from a stream of per-frame board guesses, assemble the actual sequence of moves that was played. A single frame doesn't even tell you which way the board faces (whether you're seeing it from white's side or black's) or whose move it is. It's just pieces on squares. And it gets harder when a piece is dragged, because for a few frames the piece is in the air, on no square at all, and the frame shows a board that matches no legal position. So the stream is a mess: garbage frames between the real ones, plus the occasional misread. Every position fans out into legal continuations, and you have to walk the one real path through them, where a single wrong turn can keep validating for a dozen moves before it dead-ends.

My solution was a branching tree, and it worked. At each observed board I stepped into every legal move that could explain the jump to the next one, and recursed into all of them, running the whole thing across all four orientations at once: normal and flipped, white to move and black to move. That's how I settled the orientation problem. I never tried to read which way the board faced from a single frame, I just tried all four and let the chess rules judge them. The wrong orientations died on an illegal move pretty quick. The right one kept generating legal move after legal move. So I kept the longest legal sequence, which was both the real game and the proof of which orientation had been right, and merged the overlapping ones at the end.

```scala
matchingMoves.flatMap { case (move, nextFen) =>
  board.doMove(move)
  traverse(board, remainingFens, depth + 1)   // recurse into EVERY match
    .map(seq => move +: seq)
}
```

That `flatMap` into every matching move fans out fast. On a clean three-minute clip it was fine, fifteen minutes to process. On a four-minute clip, in the unbounded form I'd shipped, it wouldn't finish: the tree grew until the RAM ran out. It wasn't unfixable. It just needed a cap on how far it could branch before pruning, guardrails I never got time to add. I only had a working version running a few days before the submission deadline, and it barely worked. I defended it for a 7. One more week of polish and I think I'd have reached a 9. But I was out of time, and through all of it the machine never helped me with the parts that were hard. I thought it through and ground it out on my own, and I finished, worse than I wanted.

After the defense, the way I worked with these tools started shifting under me. In 2023 I'd copy-pasted: read an answer in the ChatGPT window, paste it into my editor, run it, paste the error back, and around again. Then Codex and Claude Code showed up: agents you drove from the terminal that read your files and ran your code themselves. That alone was a different category of thing. And then, in November, I read a post by Alex Fazio[^alex-fazio], and it hit me as a plain oh-shit: this is about to change everything. Most of my colleagues were still dinosaurs about it, treating it as a novelty. That post was the first time I truly felt the power of it.

This was while I was at Nosto, a job I'd burned out on: bad fit, bad manager, and I was working badly. I quit it around December. And then the dread came in. I'd felt what the agent could do, and I was afraid I'd stop existing as a programmer. Now what?

If I couldn't beat it, and I couldn't, and more proof kept arriving all the time, then I'd join it and learn to work this way before it made me redundant. So I started vibe-coding, and somewhere in there I pointed the new Opus 4.6 at my old bachelor's project.

I asked it to fix my engine, the reconstruction that choked on long videos, and it couldn't. But I also handed it the job that had beaten me for two years: build a CNN to recognize the pieces. I set up a Ralph loop, the kind of setup that just keeps retrying on its own, and pointed it at the problem. And it did it. A model cleared the wall I'd quit over twice, on request. I felt sick, then ashamed. I'd burned two years on the exact thing a model had just done in one night because I asked, and I felt useless, a little depressed. It hadn't fixed everything. The engine still didn't run end to end. But that hardly mattered against the fact that it had done, in one request, what I couldn't.

I kept building anyway, six throwaway projects, on purpose, to learn the new way of working: a Strava-and-Moodle mashup, a Discord tmux-like client that runs in the terminal, a book host, a family-tree app for my uncle, a chess CLI client in Haskell, a Discord bot for an investors' club. It went on until my savings ran out and I took a new job.

Then Anthropic released Fable 5, and I pointed it at the same project. I connected it, through an open debug port, to a competitor's app (chessvision.ai, which does roughly what my thesis tried to, but professionally) so it could watch and drive the thing I'd been trying to match.

![Fable 5 driving chessvision.ai through an open debug port](/assets/blog/i-couldnt-it-couldnt-and-then-both-could/chessvision-driving.png)

Then I gave it one instruction: find five YouTube videos over an hour long, use them as backtests, and fix my engine. And I walked away.

Over that run it did the thing Opus couldn't: it made the whole engine work, end to end. It threw out my reconstruction and wrote a new one. Mine took fifteen minutes on a three-minute video and died at four. The new one handles a three-hour video in the same fifteen minutes.

And it fucking works.

<video controls width="100%" preload="metadata" poster="/assets/blog/i-couldnt-it-couldnt-and-then-both-could/chessvision-driving.png">
  <source src="/assets/blog/i-couldnt-it-couldnt-and-then-both-could/it-works.mp4" type="video/mp4" />
</video>

It did in a day what I couldn't do in two years. And it's just sad that I couldn't.

## What can I still own?
The day after it fixed my engine, Fable 5 was taken away, not from me specifically, from everyone. I'd only really used it for about a day. What struck me wasn't the loss itself. It was noticing what the loss revealed: my ability to program now runs through something a company can delete overnight. And I pay them monthly for the arrangement.

From November on, I have hated the AI. It feels bad to use, in a way that doesn't wear off. Even the best models leave room for mistakes, and that breeds a low, constant paranoia. I keep having to stop and check. The thing generates an enormous volume of code and text, and all of it lands on me to hold, so I either lose track or spend all day just keeping up with it. And it pulls you out of the feedback loop. You write the prompt, you get the result, and it doesn't feel like you did anything at all. It worked, and you didn't really do it.

The worst is that I'm forced to use it. If I don't, I get outcompeted by the people who do, so abstaining isn't really a choice. Žižek's point about how a system like this holds you is that it never has to put a gun to your head. You're free to choose. You're just not free to choose anything except the one option that keeps you in the game, and every other branch has been quietly made worse than the one they want you to take.[^zizek] I can "choose" not to use AI the same way I can choose to work at half the speed of everyone I'm competing against. And it isn't that I've been fooled. The old idea of ideology was that people go along with a bad system because they can't see what it's doing to them, so the cure is knowledge. Žižek, taking it from Sloterdijk, says this has flipped: they know very well what they are doing, but still, they are doing it.[^zizek] That is me. I know exactly what leaning on this is doing to me, and every day I sit down hating it and open it anyway because I just don't see what else I could do. It is easier to imagine the end of the world than the end of the thing grinding me down.

A tool I’m compelled to use, that I rent, that feels bad, and that can vanish on someone else’s schedule. There is nothing else to do but to own it. Deal with the process and get your own local weights, self-hosting, stay independent. But wanting it is cheap. The real question is what running your own actually buys you, for how much, today.

What you can run at home has jumped. A box built for it, NVIDIA's DGX Spark, is about forty-seven hundred dollars with 128 GB of memory, and on its own it runs models up to roughly 200 billion parameters.[^p2-spark][^p2-spark-price] Link two over a single cable and people are serving DeepSeek V4 Flash, an open, frontier-scale model, at its full million-token context, entirely on two boxes on a desk.[^p2-ds4][^p2-ds4spark] They get around forty-five tokens a second streaming out of it single-stream, several hundred a second across concurrent requests, and it reads a long prompt at close to a thousand tokens a second. I haven't bought any of it yet, but if I had the money I'd put four DGX Sparks on my desk right now. 

And open source stopped being the second-rate option. On the public chat leaderboard the gap between the best open model and the best closed one fell from about eight percent to under two in a single year, and the share of real coding problems the open models solve went from a few percent to over seventy.[^p2-hai] For most of what I actually do, a model I run myself is already good enough. I'll be strict about the ceiling, though: the very best closed models still lead the open ones by a few months, and lately that gap has widened a little, not closed.[^p2-epoch-eci] But a few months behind, on hardware I own, is a different world than it was two years ago.

The cost case is also better than the usual take admits. Once the box is paid for, nobody meters the tokens. There's no bill that climbs the harder you push it, and the thing runs off a normal wall socket. The honest catch is that it only pays off if you run it hard and constantly. For light, bursty use the hosted API is still cheaper.[^p2-arxiv] But only at today's prices, and those are subsidised to win you over. A box is a fixed cost that doesn't jump when the subsidy ends. 

Underneath all of it is an economics that makes the removal feel less like theft. Losing the model was the predictable result of how this stuff gets paid for. Frontier models are expensive to serve, and the cheap access is a subsidy. The true cost stays hidden until the subsidy lifts. When Cursor moved from a flat request cap to real usage costs, people found out the hardest requests cost an order of magnitude more than the easy ones, and the bills could climb fast.[^p2-cursor] An AI policy researcher, Lennart Heim, put the mechanism plainly: using a model ten times as hard costs the provider about ten times as much, which is precisely what flat-rate plans can't absorb.[^p2-sciam]

My Fable run was that heavy session. Five long videos, a network trained from nothing, a pipeline rebuilt, an autonomous loop spending real compute on every retry, all night. That is the workload that breaks uncapped pricing, and the providers know it. Anthropic added weekly limits aimed squarely at the small share of subscribers who run the agent continuously in the background, around the clock.[^p2-anthropic] On top of that, the machines themselves are scarce. Inference has been running near capacity, with users hitting five-hour limits in twenty minutes, providers quietly dropping heavy sessions to smaller models to save compute, and chip fabs fully booked.[^p2-sciam]

That's about as far as owning things gets me, and what I can own is real. But the frontier didn't wait there, and the model that actually beat me was a closed one, with no stake in it for me. One release later, same project, and it behaved like a different species: one frontier model got the pieces working and stopped there, the next did the entire engine, only the model changed.

So the things I get to keep are a local model, a swappable harness, and the small projects I generate myself. The frontier model itself I don't. A hosted one can be capped, repriced, or pulled overnight, and I hold no stake in it. It is also the part that did in a day what I couldn't do in two years. Everything is within reach except the one thing that actually beat me.

## What am I even for now?
So if the powerful part is rented, and permanently better than me at my hardest thing, what is left that's mine to be?

The comforting answer is supposed to be from Alex's November post, and I believe most of it. The model amplifies you rather than replacing you. It works like a multiplier on your direction: aim it well and it lifts your output a lot, aim it badly and it drags it down. Alex called it a junior you manage, but that part's now wrong. Fable knows more than I ever will, and being the technical one, the thing I spent years becoming, has stopped counting for much. But that was never really his point. He wasn't saying I'd out-code the model. He was saying it still needs someone to point it, to know what's worth building and to catch what's wrong before it ships. That part has held. The job I took runs entirely on it, and the velocity there is something I'd have called a lie a year ago: the CEO of a company I currently work at ships in a day what used to take me months, and the CTO, one of the best competitive programmers I've ever met, says flatly the model out-codes him. Both of them are still the ones supplying the intent. This is the answer that's supposed to let me carry on. It doesn't. A multiplier only lifts what's already there, and there isn't much force in me to multiply from.

His advice comes down to this: get good and lean in, because the upside is enormous. Two things I lived complicate that. First, I put in the nine years, the hard way, and I don't feel like it made me good. What I have to show is a 7 and a pile of skills the model made cheap overnight. "Be good enough to be amplified" is thin comfort when I don't feel good enough for much of anything, and the amplifier already did in a day what took me two years. Second, and worse: the thing that makes anyone good is the junior grind, the first drafts, the bug tickets, the boring work you repeat until the judgment sets. And that grind is the first thing the agents eat. The seniors are the ones winning, and Alex saw it. But seniors are only juniors who survived a decade of the exact work that's now being automated away. The bottom rungs are being cut out from under the people who haven't climbed yet. His optimism assumes you can still climb. From where I'm standing I'm not sure you can, and I'm not sure it was worth it.

This isn't only how it feels from inside my own failure. Stanford ran the payroll data for the whole country and found that the youngest workers, twenty-two to twenty-five, in the jobs most exposed to AI have seen employment fall about thirteen percent since the models landed, while older people in the exact same jobs held flat or kept growing. The cut came through hiring, so the door closed on the people who were about to walk through it.[^p3-stanford] For my own field it's blunter. New-grad hiring at the big tech firms is down more than half from where it sat before the pandemic, and new graduates are now something like seven percent of what those companies hire.[^p3-signalfire] The tasks that used to be the apprenticeship, the boilerplate and the scaffolding and the small tickets nobody senior wanted, are exactly what the agents are best at, so the bottom rung is gone. People are already noticing what that produces: juniors who ship clean-looking code and then can't debug it when it fails in a way the model didn't foresee, because the picture of the system you need to reason about the failure only forms by wrestling the thing yourself, and they never had to.[^p3-so] Everyone repeats that judgment is the scarce thing now. Sure. But you only get judgment by doing the grunt work, and the grunt work is exactly what we're handing to the machine, so I don't know where it's supposed to come from anymore.

There's another argument that goes straight at the thing I keep flinching from, and it isn't Alex's. Dan Koe has been making it for a couple of years: I've had the loss backwards the whole time. He runs what he calls the Swap Test. If you could swap the creator and the creation would be just as valuable, then AI can replace it. If the creation only works because you made it, that's your edge.[^p3-koe] The manual part, the typing and the template matching and the CNN and the reconstruction tree, was always the commodity, and a commodity goes worthless the moment the supply spikes, which is what happened the night a model rebuilt my engine. What can't be copied, he says, is the person behind it, the point of view that keeps moving. So his answer to nine years that came to nothing is that I was building the wrong asset. The durable thing was supposed to be me.

And I can't wave that off, because in one narrow place he's dead right. He says the one thing a model can't produce is a real essay, a situated point of view, an argument only you could make from where you're standing.[^p3-koe] I know it firsthand. I fed a model everything, all the context for this piece, and it wrote it badly every time. I had 144 different drafts and then after refining the prompt 144 more. The writing is the one place it couldn't stand in for me. But that is exactly where his comfort curdles, because the point of view was never the thing I wanted. I wanted to be a great programmer. I worked nine years at it, and I liked it, the small logic puzzles solved one at a time. That is the part the model made useless. So it took the thing I cared about and handed back the one thing I didn't ask for. Nine years in, I still feel like a beginner at the work I chose, and I'm still treated as one. The writing I never chose is the only part that's mine.

He does concede the machine. Once AI crosses better-faster-cheaper, he grants, it becomes economically irrational to keep humans doing the work. He brackets it as an if, but he doesn't pretend the if won't arrive.[^p3-koe] Where his answer gives out is on who it's for. The evolving self he sells, the moat, the opinion, the intersection of everything you've done, is the residue of a decade of the same commodity work he says not to value. He already banked those years. He can say skills still matter, only abstracted up a layer, but the layer where you'd build them no longer hires. That's a senior's answer. It assumes the reps are already in you. Someone starting now has no such self to fall back on, just a subscription and a market that priced the craft at zero. And his one exit, stop being an employee and turn the point of view into a one-person business, I already know I won't take. Not because it's wrong, it might be right, but because it asks me to become a personal brand built on the writing, when what I wanted was to be good at the work. His answer holds for him. For anyone climbing now it's a closed door, and for me it's a consolation prize.

And the extra output doesn't land in my pocket. I can do more, which mostly means more is expected of me. Somebody else pockets the surplus, the employer or the customer or the platform. When an engineer gets ten or a hundred times more productive, who keeps that value is just a question of who holds the leverage, and it isn't me. The IMF says the productivity gains from firms adopting AI will likely boost capital returns and favor high earners, and that in most scenarios the technology will probably worsen inequality rather than spread the gain around.[^p3-imf] I'm faster now, and the money that comes from that goes up, not to me. Doing more just means more is expected, and a review about why it isn't more still. What I get is the higher bar. The market that used to pay for careful, maintainable code now pays for throughput, so the exact discipline I ground nine years to build can read as slow. And the reassurance everyone reaches for, that technology always makes new jobs, is the one I can't cash. The WEF's own numbers put ninety-two million jobs displaced against a hundred and seventy million created by 2030, a net gain on paper, except the new roles aren't standing where the old workers are, and forty-one percent of employers say straight out that they plan to cut headcount as AI takes over the tasks.[^p3-wef] The standard answer is to move up a level. But the model already out-codes the level above me, so climbing the technical ladder buys nothing.

Some of this isn't AI's fault and I know it. The satisfaction was leaking out of the work before any of this arrived. The job I burned out on was already people-as-line-items, already the kind of work with the point squeezed out of it. AI didn't cause that. It just shoved my face in what was already true. And the grief I feel over the identity, the programmer, the guy who builds the hard thing by hand, is apparently an ordinary cycle, the same one the assembly experts went through when compilers landed, denial into anger into the rest, and most of them come out the far side saying they're more productive than ever and having more fun. Maybe. I'm not there. I'm somewhere in the anger, and I'm not convinced the acceptance stage is coming for everyone, or that it should. Some of what people are losing was worth having.

I believe software engineers survive as a role. I'm fairly sure of that. Even the labs shouting loudest that they'll automate the engineer are, visibly, hiring engineers as fast as they can, which tells you something about what the people closest to it actually believe. I also believe that because of this galactic jump in output, a large share of programmers simply won't be needed. Both are true. Nine years got me good at a thing a model now does in a day. I tried to own my way around that, and owning only buys a floor. Every way out people hand me (get good and get amplified, or become the point of view the machine can't copy) asks me to want something I never wanted. I wanted to be a great programmer, and that's the one thing none of the answers give back.

*A note from after the fact, added by the time I finished writing this.* Fable 5 came back while I was still at it, at half the tokens and only for a while, with the plan to move it behind API pricing for good. So the question changes again. It used to be what return I get on the intelligence. Now it's what return I get per dollar, and I don't know how you'd even calculate that, or compare it. Maybe the open models really are the way out. And if they are, what's left for the expensive ones, OpenAI and Anthropic, to sell?

[^alex-fazio]: Alex Fazio, X (Twitter), November 2025. https://x.com/alxfazio/status/1990530895221305581

[^zizek]: Slavoj Žižek, *The Sublime Object of Ideology* (1989). "They know very well what they are doing, but still, they are doing it" is Žižek's adaptation of Peter Sloterdijk's account of cynical reason: modern ideology works through cynical distance, you know the mask is false and act through it anyway. The "forced choice" (you may choose freely, but only the option the system requires) draws on Lacan's "forced vel."

[^fisher]: Mark Fisher, *Capitalist Realism: Is There No Alternative?* (2009). The sense that no coherent alternative to the present system is even imaginable; "it is easier to imagine the end of the world than the end of capitalism" (originating with Fredric Jameson, popularized by Žižek).

[^p2-cursor]: Cursor, "Clarifying our pricing" (June 2025). The Pro plan moved from a 500-request allowance to usage-based billing; "the hardest requests cost an order of magnitude more than simple ones"; Cursor apologized July 4 2025 and offered refunds. https://cursor.com/blog/june-2025-pricing

[^p2-spark]: NVIDIA DGX Spark product page: GB10 Grace Blackwell superchip, 128 GB unified LPDDR5x memory, up to 1 PFLOP FP4, ConnectX-7 at 200 Gbps; a single unit handles inference on models up to 200 billion parameters, and two linked units up to 405 billion. https://www.nvidia.com/en-us/products/workstations/dgx-spark/

[^p2-spark-price]: DGX Spark launched at $3,999 (Oct 15 2025), later raised to $4,699. Notebookcheck, "Nvidia GB10-powered DGX Spark gets $700 price hike" (Feb 28 2026). https://www.notebookcheck.net/Nvidia-GB10-powered-DGX-Spark-with-128-GB-LPDDR5X-memory-gets-700-price-hike.1236870.0.html

[^p2-ds4]: DeepSeek-V4-Flash, an open-weights Mixture-of-Experts model DeepSeek released April 24 2026 (about 284B parameters, ~13B active, 1M-token context). https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash

[^p2-ds4spark]: Community recipes running DeepSeek-V4-Flash (FP8) at a 1M-token context on two DGX Sparks (GB10) linked directly over ConnectX-7: roughly 45 tok/s decode single-stream, a few hundred tok/s aggregate under concurrency, and 800-920 tok/s prompt prefill. Not a vendor benchmark. tonyd2wild, "DeepSeek V4 Flash @ 1M token context on 2x NVIDIA DGX Spark," GitHub (Jun 2026), https://github.com/tonyd2wild/deepseek-v4-flash-2x-spark-1m ; corroborated on the NVIDIA DGX Spark developer forums, https://forums.developer.nvidia.com/t/deepseek-v4-flash-official-fp8-running-across-2x-dgx-spark-tp-2-mtp-200k-ctx-recipe-numbers/370309

[^p2-epoch-eci]: Epoch AI, "Open models lag state-of-the-art closed models by 4 months" (data as of May 2026), measured on the Epoch Capabilities Index; up from about 3 months in Oct 2025. https://epoch.ai/data-insights/open-closed-eci-gap

[^p2-arxiv]: Pan, Chodnekar, Roy & Wang, "A Cost-Benefit Analysis of On-Premise LLM Deployment," arXiv:2509.18101 (2025). On-premise breaks even mainly at high sustained volume or under data-residency requirements; hardware capital cost dominates, electricity secondary. https://arxiv.org/abs/2509.18101

[^p2-vllm]: vLLM Blog, "DeepSeek-V3.2-Exp in vLLM" (Sep 29 2025). The model's sparse-attention kernels shipped with support limited to Nvidia Hopper and Blackwell GPUs; other hardware written down as future work. https://vllm.ai/blog/2025-09-29-deepseek-v3-2

[^p2-ollama]: Ollama, "OpenAI compatibility" (Feb 8 2024). Local runtimes expose OpenAI-compatible endpoints, so existing tools work against a local model by changing the base URL. https://ollama.com/blog/openai-compatibility

[^p2-bfcl]: Berkeley Function-Calling Leaderboard (BFCL), UC Berkeley Gorilla team. Ranks models on tool-calling accuracy under identical interfaces; accuracy varies significantly by model. https://gorilla.cs.berkeley.edu/leaderboard.html

[^p2-multiturn]: Laban, Hayashi, Zhou & Neville, "LLMs Get Lost in Multi-Turn Conversation," arXiv:2505.06120 (May 2025). Reports an average 39% drop from single-turn to multi-turn across six tasks, and that models "get lost and do not recover" after a wrong turn. https://arxiv.org/abs/2505.06120

[^p2-ctxeng]: Anthropic, "Effective Context Engineering for AI Agents" (Sep 29 2025). Frames context as a finite resource with an "attention budget" that depletes as tokens accumulate. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

[^p2-sciam]: Lauren Leffer, "What Is the AI Compute Crunch," Scientific American (May 1 2026). Quotes Lennart Heim that using AI about 10 times more heavily costs the provider about 10 times more; reports users hitting five-hour limits in twenty minutes, providers defaulting heavy users to smaller models, and chip fabs fully booked. https://www.scientificamerican.com/article/what-is-the-ai-compute-crunch-and-why-are-ai-tools-hitting-usage-limits/

[^p2-anthropic]: Maxwell Zeff, "Anthropic unveils new rate limits to curb Claude Code power users," TechCrunch (Jul 28 2025). Weekly rate limits aimed at the estimated under-5% of subscribers running Claude Code "continuously in the background, 24/7." https://techcrunch.com/2025/07/28/anthropic-unveils-new-rate-limits-to-curb-claude-code-power-users/

[^p2-hai]: Stanford HAI, "2025 AI Index Report, Technical Performance." Chatbot Arena gap between top closed and open models narrowed from 8.04% (Jan 2024) to 1.70% (Feb 2025); SWE-bench solved rose from 4.4% (2023) to 71.7% (2024). https://hai.stanford.edu/ai-index/2025-ai-index-report/technical-performance

[^p3-stanford]: Erik Brynjolfsson, Bharat Chandar & Ruyu Chen, "Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence," Stanford Digital Economy Lab (Nov 13 2025). Workers aged 22 to 25 in the most AI-exposed occupations saw a roughly 13% relative employment decline (16% after firm-level controls), while older workers in the same occupations were flat or growing; adjustment came through reduced hiring rather than wages. https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/

[^p3-signalfire]: SignalFire, "State of Tech Talent Report 2025." New-grad hiring at Big Tech is down about 25% from 2023 and more than 50% from pre-pandemic 2019; new grads now account for about 7% of Big Tech hires. https://www.signalfire.com/blog/signalfire-state-of-talent-report-2025

[^p3-so]: "AI vs Gen Z: How AI has changed the career pathway for junior developers," The Stack Overflow Blog (Dec 26 2025). Argues AI has made junior developers less competent at foundational skills like debugging; tech internship postings down about 30% since 2023; 70% of hiring managers believe AI can do the work of interns. https://stackoverflow.blog/2025/12/26/ai-vs-gen-z/

[^p3-koe]: Dan Koe, 2026 essays (e.g., https://x.com/thedankoe/status/2014022520513634718). The "Swap Test" ("If you could swap the creator and the creation would be just as valuable, then AI can replace it"); that what can't be copied is the person, "the point of view that keeps moving"; that AI cannot write a genuine essay, meaning an argument from a situated point of view; "the ultimate moat is an opinion" and "your edge lies more in intersection than expertise"; that once AI crosses "better, faster, cheaper, safer" it becomes "economically irrational to keep humans doing the work" (which Koe brackets as a conditional and declines to moralize); and that the exit is to stop being an employee and build a one-person business around your own audience and output. Koe is explicitly pro-AI and holds that skills still matter, only "abstracted up a layer." Quotes verified against Koe's essay text.

[^p3-imf]: Kristalina Georgieva, "AI Will Transform the Global Economy. Let's Make Sure It Benefits Humanity," IMF Blog (Jan 14 2024). "Gains in productivity from firms that adopt AI will likely boost capital returns, which may also favor high earners"; "In most scenarios, AI will likely worsen overall inequality." https://www.imf.org/en/blogs/articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity

[^p3-wef]: World Economic Forum, "Future of Jobs Report 2025" (Jan 2025). Projects 170 million new roles and 92 million displaced by 2030 (net +78 million, 22% churn); 41% of employers plan to reduce their workforce as AI automates tasks. https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces/

[^cs231n]: Allen Wu, "Efficient Chess Vision: A Computer Vision Application," CS231n Technical Report, Stanford University, 2022. http://cs231n.stanford.edu/reports/2022/pdfs/123.pdf
