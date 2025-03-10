document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const inputDataElem = document.getElementById('input-data');
    const compressBtn = document.getElementById('compress-btn');
    const stepBackBtn = document.getElementById('step-back-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentStepElem = document.getElementById('current-step');
    const compressionRatioElem = document.getElementById('compression-ratio');
    const windowBytesElem = document.getElementById('window-bytes');
    const outputBytesElem = document.getElementById('output-bytes');
    const matchVisualizationElem = document.getElementById('match-visualization');
    const currentExplanationElem = document.getElementById('current-explanation');
    const autoPlayCheckbox = document.getElementById('auto-play');
    const speedControl = document.getElementById('speed-control');
    
    // State
    let compressionSteps = [];
    let compressedData = [];
    let originalData = [];
    let currentStepIdx = -1;
    let isPlaying = false;
    let animationInterval;
    let animationSpeed = 1000;

    // Initialize speed from slider
    updateAnimationSpeed();
    
    // Event Listeners
    compressBtn.addEventListener('click', startCompression);
    stepBackBtn.addEventListener('click', () => stepAnimation(-1));
    stepForwardBtn.addEventListener('click', () => stepAnimation(1));
    playPauseBtn.addEventListener('click', togglePlayPause);
    resetBtn.addEventListener('click', resetVisualization);
    speedControl.addEventListener('input', updateAnimationSpeed);
    
    function updateAnimationSpeed() {
        // Convert the 1-10 range to milliseconds (slower to faster)
        const speedValue = parseInt(speedControl.value);
        animationSpeed = 2000 / speedValue;
        
        // If animation is running, restart it with new speed
        if (isPlaying) {
            clearInterval(animationInterval);
            animationInterval = setInterval(() => stepAnimation(1), animationSpeed);
        }
    }
    
    function startCompression() {
        const inputData = inputDataElem.value;
        
        if (!inputData.trim()) {
            alert('Please enter some data to compress');
            return;
        }
        
        // Reset UI
        resetVisualization();
        
        // Show loading state
        compressBtn.disabled = true;
        compressBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Compressing...';
        
        // Send compression request
        fetch('/compress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: inputData }),
        })
        .then(response => response.json())
        .then(data => {
            originalData = data.original_data;
            compressedData = data.compressed_data;
            compressionSteps = data.steps;
            compressionRatioElem.textContent = data.compression_ratio.toFixed(2) + 'x';
            
            // Enable controls
            stepBackBtn.disabled = false;
            stepForwardBtn.disabled = false;
            playPauseBtn.disabled = false;
            
            // Update UI
            currentStepElem.textContent = `0/${compressionSteps.length}`;
            progressBar.style.width = '0%';
            
            // Set up initial visualization
            renderOriginalData();
            
            // Auto-play if checked
            if (autoPlayCheckbox.checked) {
                isPlaying = true;
                playPauseBtn.textContent = 'Pause';
                animationInterval = setInterval(() => stepAnimation(1), animationSpeed);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during compression');
        })
        .finally(() => {
            compressBtn.disabled = false;
            compressBtn.textContent = 'Compress';
        });
    }
    
    function renderOriginalData() {
        windowBytesElem.innerHTML = '';
        
        // Render original data bytes
        originalData.forEach((byte, idx) => {
            const byteElem = document.createElement('div');
            byteElem.className = 'byte';
            byteElem.dataset.index = idx;
            
            // Display ASCII character if printable, otherwise show byte value
            if (byte >= 32 && byte <= 126) {
                byteElem.textContent = String.fromCharCode(byte);
            } else {
                byteElem.textContent = byte;
            }
            
            windowBytesElem.appendChild(byteElem);
        });
    }
    
    function stepAnimation(direction) {
        // Calculate new step index
        const newStepIdx = currentStepIdx + direction;
        
        // Check bounds
        if (newStepIdx < -1 || newStepIdx >= compressionSteps.length) {
            if (isPlaying && newStepIdx >= compressionSteps.length) {
                // Stop animation when we reach the end
                togglePlayPause();
            }
            return;
        }
        
        // Update current step
        currentStepIdx = newStepIdx;
        
        // Update UI
        updateStepUI();
        
        if (currentStepIdx === compressionSteps.length - 1) {
            // Reached the end, disable forward button
            stepForwardBtn.disabled = true;
        } else {
            stepForwardBtn.disabled = false;
        }
        
        if (currentStepIdx === -1) {
            // At the beginning, disable back button
            stepBackBtn.disabled = true;
        } else {
            stepBackBtn.disabled = false;
        }
    }
    
    function updateStepUI() {
        // Update progress indicators
        currentStepElem.textContent = `${currentStepIdx + 1}/${compressionSteps.length}`;
        const progressPercentage = ((currentStepIdx + 1) / compressionSteps.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Clear previous visualization
        clearVisualization();
        
        if (currentStepIdx === -1) {
            // Show initial state
            renderOriginalData();
            currentExplanationElem.textContent = 'Starting compression. The algorithm will process each byte of input data.';
            return;
        }
        
        // Get current step data
        const step = compressionSteps[currentStepIdx];
        
        // Visualize the current window state
        visualizeWindow(step);
        
        // Visualize matches if available
        visualizeMatches(step);
        
        // Update the compression output
        updateCompressionOutput(step);
        
        // Update explanation
        updateExplanation(step);
    }
    
    function visualizeWindow(step) {
        // Reset all bytes to default style
        const byteElements = windowBytesElem.querySelectorAll('.byte');
        byteElements.forEach(elem => {
            elem.className = 'byte';
        });
        
        // Highlight the window area
        for (let i = step.window_start; i < step.position; i++) {
            const byteElem = byteElements[i];
            if (byteElem) {
                byteElem.classList.add('window-color');
            }
        }
        
        // Highlight current position
        if (step.position < byteElements.length) {
            byteElements[step.position].classList.add('current-pos-color');
        }
        
        // Highlight best match if there is one
        if (step.action === 'match') {
            const matchStart = step.best_match_start;
            const matchLength = step.match_length;
            
            for (let i = 0; i < matchLength; i++) {
                // Highlight in window
                if (matchStart + i < step.position) {
                    byteElements[matchStart + i].classList.add('best-match-color');
                }
                
                // Highlight current position and forward
                if (step.position + i < byteElements.length) {
                    byteElements[step.position + i].classList.add('match-color');
                }
            }
        } else if (step.action === 'literal') {
            // Highlight the literal byte
            byteElements[step.position].classList.add('literal-color');
        }
    }
    
    function visualizeMatches(step) {
        matchVisualizationElem.innerHTML = '';
        
        if (step.matches && step.matches.length > 0) {
            // Create a text representation of matches
            const matchesDiv = document.createElement('div');
            matchesDiv.className = 'matches-list fade-in';
            
            // Show possible matches
            let matchesHTML = '<h5>Possible Matches Found:</h5>';
            step.matches.forEach((match, idx) => {
                const isSelected = (step.action === 'match' && step.best_match_start === match.start);
                matchesHTML += `
                    <div class="match-item ${isSelected ? 'selected' : ''}">
                        <span class="match-num">${idx + 1}.</span> 
                        <span class="match-pos">Position ${match.start}</span>
                        <span class="match-len">Length: ${match.length}</span>
                        <span class="match-bytes">${match.matched_bytes.map(b => 
                            typeof b === 'number' && b >= 32 && b <= 126 ? 
                            String.fromCharCode(b) : b
                        ).join(' ')}</span>
                        ${isSelected ? '<span class="match-selected">✓ Selected</span>' : ''}
                    </div>
                `;
            });
            
            matchesDiv.innerHTML = matchesHTML;
            matchVisualizationElem.appendChild(matchesDiv);
            
            // Create a visualization of the best match connection
            if (step.action === 'match') {
                const svgContainer = document.createElement('div');
                svgContainer.className = 'match-connection-viz fade-in';
                svgContainer.innerHTML = `
                    <svg width="100%" height="50">
                        <line x1="20%" y1="25" x2="80%" y2="25" class="match-line" />
                        <text x="10%" y="25" text-anchor="end">Original</text>
                        <text x="90%" y="25" text-anchor="start">Current</text>
                    </svg>
                    <p>Match found: (offset=${step.match_offset}, length=${step.match_length})</p>
                `;
                matchVisualizationElem.appendChild(svgContainer);
            }
        } else {
            const noMatchesDiv = document.createElement('div');
            noMatchesDiv.className = 'no-matches fade-in';
            noMatchesDiv.textContent = 'No matches found. Storing as literal byte.';
            matchVisualizationElem.appendChild(noMatchesDiv);
        }
    }
    
    function updateCompressionOutput(step) {
        // Get all the compression outputs up to this step
        const currentOutputs = compressionSteps
            .slice(0, currentStepIdx + 1)
            .map(s => {
                if (s.action === 'match') {
                    return {
                        type: 'match', 
                        offset: s.match_offset, 
                        length: s.match_length
                    };
                } else {
                    return {
                        type: 'literal',
                        value: s.literal_value
                    };
                }
            });
        
        // Display the output
        outputBytesElem.innerHTML = '';
        currentOutputs.forEach(output => {
            const outputElem = document.createElement('div');
            
            if (output.type === 'match') {
                outputElem.className = 'byte match-color';
                
                // Use more compact display format
                const matchInfo = document.createElement('div');
                matchInfo.className = 'match-info';
                matchInfo.textContent = `${output.offset},${output.length}`;
                
                // Add tooltip with detailed information
                const tooltip = document.createElement('span');
                tooltip.className = 'match-tooltip';
                tooltip.textContent = `Offset: ${output.offset}, Length: ${output.length}`;
                
                outputElem.appendChild(matchInfo);
                outputElem.appendChild(tooltip);
                
                // Visual hint: make background color intensity proportional to match length
                // Longer matches = more saturated color (better compression)
                const saturation = Math.min(100, 50 + output.length * 5); // Increase saturation with match length
                outputElem.style.backgroundColor = `hsl(45, ${saturation}%, 65%)`;
            } else {
                outputElem.className = 'byte literal-color';
                // Display ASCII character if printable, otherwise show byte value
                const value = output.value;
                if (value >= 32 && value <= 126) {
                    outputElem.textContent = String.fromCharCode(value);
                } else {
                    outputElem.textContent = value;
                }
            }
            
            // Highlight the last added element
            if (outputBytesElem.children.length === currentStepIdx) {
                outputElem.classList.add('fade-in');
            }
            
            outputBytesElem.appendChild(outputElem);
        });
    }
    
    function updateExplanation(step) {
        let explanation = '';
        
        if (step.action === 'match') {
            explanation = `
                Found a match of length ${step.match_length} at offset ${step.match_offset}.
                Instead of storing ${step.match_length} individual bytes, we store a reference (${step.match_offset}, ${step.match_length}).
                This saves ${step.match_length - 2} bytes of space (assuming references use 2 bytes).
            `;
        } else {
            explanation = `
                No significant match found, so storing the literal byte ${step.literal_value}
                (${step.literal_value >= 32 && step.literal_value <= 126 ? String.fromCharCode(step.literal_value) : 'non-printable'}).
            `;
        }
        
        currentExplanationElem.innerHTML = explanation;
    }
    
    function clearVisualization() {
        // Clear match visualization area
        matchVisualizationElem.innerHTML = '';
    }
    
    function resetVisualization() {
        // Reset state
        currentStepIdx = -1;
        isPlaying = false;
        
        // Clear animation interval
        clearInterval(animationInterval);
        
        // Reset UI
        windowBytesElem.innerHTML = '';
        outputBytesElem.innerHTML = '';
        matchVisualizationElem.innerHTML = '';
        currentExplanationElem.textContent = 'Press "Compress" to start the visualization.';
        currentStepElem.textContent = '0/0';
        progressBar.style.width = '0%';
        compressionRatioElem.textContent = '-';
        
        // Reset buttons
        stepBackBtn.disabled = true;
        stepForwardBtn.disabled = true;
        playPauseBtn.textContent = 'Play';
    }
    
    function togglePlayPause() {
        if (isPlaying) {
            // Pause animation
            clearInterval(animationInterval);
            playPauseBtn.textContent = 'Play';
        } else {
            // Start or resume animation
            if (currentStepIdx < compressionSteps.length - 1) {
                animationInterval = setInterval(() => stepAnimation(1), animationSpeed);
                playPauseBtn.textContent = 'Pause';
            }
        }
        
        isPlaying = !isPlaying;
    }
});
