
        // Navigation functionality


        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.remove('hidden');
            document.getElementById(sectionId).classList.add('fade-in');
            
            // Update navigation buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            event.target.classList.add('active');
        }

        // Layer toggle functionality
        function toggleLayer(element) {
            const details = element.querySelector('.layer-details');
            const icon = element.querySelector('.layer-toggle');
            
            if (details.classList.contains('hidden')) {
                // Close all other layers
                document.querySelectorAll('.layer-details').forEach(detail => {
                    detail.classList.add('hidden');
                });
                document.querySelectorAll('.layer-card').forEach(card => {
                    card.classList.remove('layer-active');
                });
                document.querySelectorAll('.layer-toggle').forEach(i => {
                    i.textContent = '+';
                });
                
                // Open this layer
                details.classList.remove('hidden');
                details.classList.add('fade-in');
                element.classList.add('layer-active');
                icon.textContent = '−';
            } else {
                // Close this layer
                details.classList.add('hidden');
                element.classList.remove('layer-active');
                icon.textContent = '+';
            }
        }

        // Quiz functionality
        function checkAnswer(button, isCorrect) {
            const feedback = document.getElementById('quiz-feedback');
            const options = document.querySelectorAll('.quiz-option');
            
            // Disable all options
            options.forEach(option => {
                option.disabled = true;
            });
            
            if (isCorrect) {
                button.classList.add('correct-answer');
                feedback.innerHTML = '<div class="feedback-box feedback-correct"><strong>¡Correcto!</strong> Los routers operan en la Capa 3 (Red) porque toman decisiones de enrutamiento basadas en direcciones IP.</div>';
            } else {
                button.classList.add('incorrect-answer');
                // Highlight correct answer
                options.forEach(option => {
                    if (option.onclick.toString().includes('true')) {
                        option.classList.add('correct-answer');
                    }
                });
                feedback.innerHTML = '<div class="feedback-box feedback-incorrect"><strong>Incorrecto.</strong> Los routers operan en la Capa 3 (Red) porque manejan el enrutamiento de paquetes IP.</div>';
            }
            
            feedback.classList.remove('hidden');
            feedback.classList.add('fade-in');
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            showSection('overview');
        });