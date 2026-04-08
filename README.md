# Bloom Filter Visualizer

An interactive Bloom Filter visualizer built with React + Vite. See exactly how hash functions map words to bit positions, watch bits get set in real-time, and explore false positives hands-on.

## Features

- **Insert & look up** words with step-by-step animated hash calculations
- **6 hash algorithms**: djb2, fnv1a, sdbm, murmur3, crc32, jenkins
- **Parametrize everything**: bit array size (8–512), number of hash functions (1–6), animation speed
- **Live stats**: saturation %, estimated false positive rate, optimal k recommendation
- **False positive detection**: clearly distinguishes definite hits, false positives, and guaranteed absences
- **Dark theme** with per-hash color coding and overlap visualization

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Usage

- **Enter** — insert the typed word
- **Tab** — look up the typed word
- Click suggestion chips to pre-fill the input
- Open **Parameters** to change bit array size, hash functions, and animation speed
- **Reset** clears the filter (automatically resets when you change parameters)

## How a Bloom Filter Works

1. **Insert**: run the word through all k hash functions, set each resulting bit index to 1
2. **Look up**: check all k bit positions — if any is 0, the word is **definitely absent**; if all are 1, the word is **probably present**
3. **False positives** happen when all bits were set by different insertions — unavoidable but tunable
4. **No false negatives** — a 0 bit was never set, guaranteed

The false positive rate follows: `(1 - e^(-kn/m))^k` where m = bits, k = hash functions, n = items inserted.
