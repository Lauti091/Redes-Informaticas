// ===== CONSTANTS AND CONFIGURATION =====
const CONFIG = {
  SCROLL_THRESHOLD: 300,
  ANIMATION_DELAY: 200,
  TYPING_SPEED: 100,
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: "0px 0px -50px 0px",
}

// ===== UTILITY FUNCTIONS =====
const utils = {
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments

      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  isInViewport(element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },

  scrollToElement(element, offset = 80) {
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    })
  },

  getElementById(id) {
    const element = document.getElementById(id)
    if (!element) {
      console.warn(`Element with ID '${id}' not found`)
    }
    return element
  },

  addEventListenerSafe(element, event, handler, options = {}) {
    if (!element) return
    try {
      element.addEventListener(event, handler, options)
    } catch (error) {
      console.error(`Error adding event listener for ${event}:`, error)
    }
  },
}

// ===== NAVIGATION MODULE =====
const Navigation = {
  init() {
    this.hamburger = utils.getElementById("hamburger")
    this.navMenu = utils.getElementById("nav-menu")
    this.navLinks = document.querySelectorAll(".nav-link")
    this.overlay = utils.getElementById("menu-overlay") // 👈 overlay agregado

    this.bindEvents()
    this.setActiveLink()
  },

  bindEvents() {
    utils.addEventListenerSafe(this.hamburger, "click", () => {
      this.toggleMobileMenu()
    })

    this.navLinks.forEach((link) => {
      utils.addEventListenerSafe(link, "click", () => {
        this.closeMobileMenu()
      })
    })

    utils.addEventListenerSafe(document, "click", (e) => {
      if (
        !this.hamburger?.contains(e.target) &&
        !this.navMenu?.contains(e.target) &&
        !this.overlay?.contains(e.target)
      ) {
        this.closeMobileMenu()
      }
    })

    utils.addEventListenerSafe(document, "keydown", (e) => {
      if (e.key === "Escape") {
        this.closeMobileMenu()
      }
    })

    // 👇 cerrar al tocar el overlay
    utils.addEventListenerSafe(this.overlay, "click", () => {
      this.closeMobileMenu()
    })
  },

  toggleMobileMenu() {
    if (!this.hamburger || !this.navMenu) return

    const isActive = this.hamburger.classList.contains("active")

    this.hamburger.classList.toggle("active")
    this.navMenu.classList.toggle("active")
    this.overlay?.classList.toggle("active")

    this.hamburger.setAttribute("aria-expanded", !isActive)
    document.body.style.overflow = isActive ? "" : "hidden"
  },

  closeMobileMenu() {
    if (!this.hamburger || !this.navMenu) return

    this.hamburger.classList.remove("active")
    this.navMenu.classList.remove("active")
    this.overlay?.classList.remove("active")
    this.hamburger.setAttribute("aria-expanded", "false")
    document.body.style.overflow = ""
  },

  setActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html"

    this.navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href")
      if (linkHref === currentPage) {
        link.classList.add("active")
        link.setAttribute("aria-current", "page")
      } else {
        link.classList.remove("active")
        link.removeAttribute("aria-current")
      }
    })
  },
}

// ===== SCROLL MODULE =====
const ScrollManager = {
  init() {
    this.scrollTopBtn = utils.getElementById("scrollTop")
    this.header = document.querySelector(".header")
    this.bindEvents()
  },

  bindEvents() {
    const throttledScrollHandler = utils.throttle(() => {
      this.handleScroll()
    }, 16)

    utils.addEventListenerSafe(window, "scroll", throttledScrollHandler)

    utils.addEventListenerSafe(this.scrollTopBtn, "click", () => {
      this.scrollToTop()
    })
  },

  handleScroll() {
    const scrollY = window.pageYOffset
    this.toggleScrollTopButton(scrollY)
    this.toggleHeaderShadow(scrollY)
    this.updateActiveNavigation()
  },

  toggleScrollTopButton(scrollY) {
    if (!this.scrollTopBtn) return
    if (scrollY > CONFIG.SCROLL_THRESHOLD) {
      this.scrollTopBtn.classList.add("visible")
    } else {
      this.scrollTopBtn.classList.remove("visible")
    }
  },

  toggleHeaderShadow(scrollY) {
    if (!this.header) return
    if (scrollY > 10) {
      this.header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)"
    } else {
      this.header.style.boxShadow = ""
    }
  },

  updateActiveNavigation() {
    const sections = document.querySelectorAll("section[id]")
    const navLinks = document.querySelectorAll(".nav-link")

    let currentSection = ""

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100
      const sectionHeight = section.clientHeight

      if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id")
      }
    })

    navLinks.forEach((link) => {
      const href = link.getAttribute("href")
      if (href && href.includes("#" + currentSection)) {
        link.classList.add("active")
      } else if (!href || !href.includes("#")) {
        return
      } else {
        link.classList.remove("active")
      }
    })
  },

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  },
}

// ===== ANIMATIONS MODULE =====
const Animations = {
  init() {
    this.setupIntersectionObserver()
    this.initializeAnimations()
  },

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: CONFIG.INTERSECTION_ROOT_MARGIN,
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target)
          this.observer.unobserve(entry.target)
        }
      })
    }, observerOptions)
  },

  initializeAnimations() {
    const animatedElements = document.querySelectorAll(`
      .content-card,
      .tech-item,
      .element,
      .network-type,
      .topology-item,
      .course-card,
      .network-diagram,
      .communication-elements > *,
      .tech-examples > *
    `)

    animatedElements.forEach((element, index) => {
      element.style.opacity = "0"
      element.style.transform = "translateY(30px)"
      element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`
      this.observer.observe(element)
    })
  },

  animateElement(element) {
    element.style.opacity = "1"
    element.style.transform = "translateY(0)"
  },

  typeWriter(element, text, speed = CONFIG.TYPING_SPEED) {
    if (!element || !text) return
    let i = 0
    element.innerHTML = ""
    element.style.borderRight = "2px solid"
    element.style.animation = "blink 1s infinite"

    const type = () => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i)
        i++
        setTimeout(type, speed)
      } else {
        setTimeout(() => {
          element.style.borderRight = "none"
          element.style.animation = "none"
        }, 1000)
      }
    }
    type()
  },
}

// ===== ACCESSIBILITY MODULE =====
const Accessibility = {
  init() {
    this.setupKeyboardNavigation()
    this.setupFocusManagement()
    this.setupARIALabels()
  },

  setupKeyboardNavigation() {
    const interactiveElements = document.querySelectorAll(`
      .course-card,
      .tech-item,
      .network-type,
      .topology-item
    `)

    interactiveElements.forEach((element) => {
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "0")
      }

      utils.addEventListenerSafe(element, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          element.click()
        }
      })
    })
  },

  setupFocusManagement() {
    const hamburger = utils.getElementById("hamburger")
    const navMenu = utils.getElementById("nav-menu")

    if (hamburger && navMenu) {
      utils.addEventListenerSafe(hamburger, "click", () => {
        setTimeout(() => {
          if (navMenu.classList.contains("active")) {
            const firstLink = navMenu.querySelector(".nav-link")
            if (firstLink) firstLink.focus()
          }
        }, 100)
      })
    }
  },

  setupARIALabels() {
    const scrollTopBtn = utils.getElementById("scrollTop")
    if (scrollTopBtn && !scrollTopBtn.hasAttribute("aria-label")) {
      scrollTopBtn.setAttribute("aria-label", "Volver al inicio")
    }

    const diagrams = document.querySelectorAll(".network-diagram, .topology-diagram")
    diagrams.forEach((diagram) => {
      if (!diagram.hasAttribute("role")) {
        diagram.setAttribute("role", "img")
      }
    })
  },
}

// ===== PERFORMANCE MODULE =====
const Performance = {
  init() {
    this.setupLazyLoading()
    this.preloadCriticalResources()
  },

  setupLazyLoading() {
    const images = document.querySelectorAll("img[data-src]")

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.removeAttribute("data-src")
            imageObserver.unobserve(img)
          }
        })
      })
      images.forEach((img) => imageObserver.observe(img))
    } else {
      images.forEach((img) => {
        img.src = img.dataset.src
        img.removeAttribute("data-src")
      })
    }
  },

  preloadCriticalResources() {
    const criticalResources = [
      { href: "css/styles.css", as: "style" },
      { href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap", as: "style" },
    ]

    criticalResources.forEach((resource) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = resource.href
      link.as = resource.as
      document.head.appendChild(link)
    })
  },
}



// ===== CUSTOM SCROLL FUNCTION =====
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    // 👇 desplazamiento sin offset (queda bien arriba)
    utils.scrollToElement(element, 0);
  }
}


// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  Navigation.init()
  ScrollManager.init()
  Animations.init()
  Accessibility.init()
  Performance.init()
  Search.init()
})

const Search = {
  init() {
    this.createSearchFunction()
  },

  createSearchFunction() {
    // Create search functionality for the site
    const searchContainer = document.createElement("div")
    searchContainer.className = "search-container"
    searchContainer.innerHTML = `
      <div class="search-wrapper">
        <input type="text" id="site-search" placeholder="Buscar en el sitio..." aria-label="Buscar contenido">
        <button type="button" class="search-btn" aria-label="Realizar búsqueda">
          <span aria-hidden="true">🔍</span>
        </button>
      </div>
      <div id="search-results" class="search-results" aria-live="polite"></div>
    `

    // Add search styles
    const searchStyles = document.createElement("style")
    searchStyles.textContent = `
      .search-container {
        position: fixed;
        top: 80px;
        right: 80px;
        z-index: var(--z-dropdown);
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-normal);
      }
      
      .search-container.active {
        opacity: 1;
        visibility: visible;
      }
      
      .search-wrapper {
        display: flex;
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
      }
      
      #site-search {
        padding: var(--spacing-3) var(--spacing-4);
        border: none;
        outline: none;
        font-size: var(--font-size-sm);
        min-width: 250px;
      }
      
      .search-btn {
        padding: var(--spacing-3);
        background: var(--primary-color);
        color: var(--white);
        border: none;
        cursor: pointer;
        transition: background-color var(--transition-fast);
      }
      
      .search-btn:hover {
        background: var(--primary-dark);
      }
      
      .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        max-height: 300px;
        overflow-y: auto;
        margin-top: var(--spacing-2);
        display: none;
      }
      
      .search-results.active {
        display: block;
      }
      
      .search-result-item {
        padding: var(--spacing-3) var(--spacing-4);
        border-bottom: 1px solid var(--gray-200);
        cursor: pointer;
        transition: background-color var(--transition-fast);
      }
      
      .search-result-item:hover {
        background: var(--gray-50);
      }
      
      .search-result-item:last-child {
        border-bottom: none;
      }
      
      .search-result-title {
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: var(--spacing-1);
      }
      
      .search-result-snippet {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
      }
      
      @media (max-width: 768px) {
        .search-container {
          top: 70px;
          right: var(--spacing-4);
          left: var(--spacing-4);
        }
        
        #site-search {
          min-width: auto;
        }
      }
    `
    document.head.appendChild(searchStyles)

    // Add search container to body
    document.body.appendChild(searchContainer)

    // Create search toggle button
    const searchToggle = document.createElement("button")
    searchToggle.className = "search-toggle"
    searchToggle.innerHTML = '<span aria-hidden="true">🔍</span>'
    searchToggle.setAttribute("aria-label", "Abrir búsqueda")
    searchToggle.style.cssText = `
      position: fixed;
      top: 90px;
      right: var(--spacing-4);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--primary-color);
      color: var(--white);
      font-size: var(--font-size-base);
      cursor: pointer;
      z-index: var(--z-fixed);
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-md);
    `

    document.body.appendChild(searchToggle)

    // Search functionality
    const searchInput = utils.getElementById("site-search")
    const searchResults = utils.getElementById("search-results")
    const searchBtn = searchContainer.querySelector(".search-btn")

    // Toggle search visibility
    utils.addEventListenerSafe(searchToggle, "click", () => {
      const isActive = searchContainer.classList.contains("active")
      searchContainer.classList.toggle("active")

      if (!isActive) {
        setTimeout(() => searchInput?.focus(), 100)
      }
    })

    // Perform search
    const performSearch = () => {
      const query = searchInput?.value.toLowerCase().trim()
      if (!query) {
        searchResults.classList.remove("active")
        return
      }

      // Simple content search
      const searchableContent = this.getSearchableContent()
      const results = searchableContent
        .filter((item) => item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query))
        .slice(0, 5)

      this.displaySearchResults(results, query)
    }

    utils.addEventListenerSafe(searchInput, "input", utils.debounce(performSearch, 300))
    utils.addEventListenerSafe(searchBtn, "click", performSearch)

    // Close search on escape
    utils.addEventListenerSafe(document, "keydown", (e) => {
      if (e.key === "Escape") {
        searchContainer.classList.remove("active")
        searchResults.classList.remove("active")
      }
    })

    // Close search when clicking outside
    utils.addEventListenerSafe(document, "click", (e) => {
      if (!searchContainer.contains(e.target) && !searchToggle.contains(e.target)) {
        searchContainer.classList.remove("active")
        searchResults.classList.remove("active")
      }
    })
  },

  getSearchableContent() {
    // Extract searchable content from the page
    const content = []

    // Get all headings and their associated content
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    headings.forEach((heading) => {
      let contentText = ""
      let nextElement = heading.nextElementSibling

      // Collect content until next heading
      while (nextElement && !nextElement.matches("h1, h2, h3, h4, h5, h6")) {
        if (nextElement.textContent) {
          contentText += nextElement.textContent + " "
        }
        nextElement = nextElement.nextElementSibling
      }

      content.push({
        title: heading.textContent.trim(),
        content: contentText.trim(),
        element: heading,
        url: window.location.href + "#" + (heading.id || ""),
      })
    })

    return content
  },

  displaySearchResults(results, query) {
    const searchResults = utils.getElementById("search-results")
    if (!searchResults) return

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-result-item">
          <div class="search-result-title">No se encontraron resultados</div>
          <div class="search-result-snippet">Intenta con otros términos de búsqueda</div>
        </div>
      `
    } else {
      searchResults.innerHTML = results
        .map((result) => {
          const snippet = this.highlightQuery(result.content.substring(0, 150) + "...", query)
          const title = this.highlightQuery(result.title, query)

          return `
          <div class="search-result-item" data-url="${result.url}">
            <div class="search-result-title">${title}</div>
            <div class="search-result-snippet">${snippet}</div>
          </div>
        `
        })
        .join("")

      // Add click handlers to results
      searchResults.querySelectorAll(".search-result-item").forEach((item) => {
        utils.addEventListenerSafe(item, "click", () => {
          const url = item.dataset.url
          if (url && url.includes("#")) {
            const elementId = url.split("#")[1]
            const element = document.getElementById(elementId)
            if (element) {
              utils.scrollToElement(element)
              searchResults.classList.remove("active")
              document.querySelector(".search-container").classList.remove("active")
            }
          }
        })
      })
    }

    searchResults.classList.add("active")
  },

  highlightQuery(text, query) {
    if (!query) return text
    const regex = new RegExp(`(${query})`, "gi")
    return text.replace(regex, "<mark>$1</mark>")
  },
}

// ===== GLOBAL FUNCTIONS =====
window.scrollToSection = (sectionId) => {
  const section = utils.getElementById(sectionId)
  if (section) {
    const elementPosition = section.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - 0  // 👈 bajá un poco más

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    })
  }
}


function calculateTransferTime() {
  const fileSize = parseFloat(document.getElementById("fileSize").value); // MB
  const bandwidth = parseFloat(document.getElementById("bandwidth").value); // Mbps
  const resultBox = document.getElementById("result");
  const explanationBox = document.getElementById("calc-explanation");

  // Reset
  resultBox.className = "calc-result";
  resultBox.innerHTML = "";
  explanationBox.innerHTML = "";

  if (isNaN(fileSize) || isNaN(bandwidth) || fileSize <= 0 || bandwidth <= 0) {
    resultBox.classList.add("error");
    resultBox.innerHTML = "<p class='calc-message'>⚠️ Por favor ingresa valores válidos.</p>";
    return;
  }

  // Conversión: MB -> Megabits
  const fileSizeMb = fileSize * 8; // 1 byte = 8 bits → 1 MB = 8 Mb
  const timeSeconds = fileSizeMb / bandwidth;

  // Resultado
  resultBox.classList.add("success");
  resultBox.innerHTML = `<p class="calc-message">⏱️ Tiempo estimado: <strong>${timeSeconds.toFixed(2)} segundos</strong></p>`;

  // Explicación adicional
  if (timeSeconds < 60) {
    explanationBox.innerHTML = `El archivo de ${fileSize} MB se transfiere en menos de un minuto con ${bandwidth} Mbps.`;
  } else if (timeSeconds < 3600) {
    const minutes = (timeSeconds / 60).toFixed(1);
    explanationBox.innerHTML = `El archivo de ${fileSize} MB tardará aproximadamente ${minutes} minutos a ${bandwidth} Mbps.`;
  } else {
    const hours = (timeSeconds / 3600).toFixed(1);
    explanationBox.innerHTML = `La transferencia del archivo de ${fileSize} MB puede tardar unas ${hours} horas a ${bandwidth} Mbps.`;
  }
}

window.toggleLayer = (layerCard) => {
  if (!layerCard) return

  const layerDetails = layerCard.querySelector(".layer-details")
  const toggleButton = layerCard.querySelector(".layer-toggle")

  if (!layerDetails || !toggleButton) return

  const isExpanded = !layerDetails.hidden

  // Toggle visibility
  layerDetails.hidden = isExpanded
  toggleButton.textContent = isExpanded ? "+" : "−"
  toggleButton.setAttribute("aria-expanded", !isExpanded)

  // Update ARIA label
  const layerTitle = layerCard.querySelector(".layer-title")?.textContent || "capa"
  toggleButton.setAttribute("aria-label", isExpanded ? `Expandir ${layerTitle}` : `Contraer ${layerTitle}`)

  // Smooth animation
  if (!isExpanded) {
    layerDetails.style.maxHeight = "0"
    layerDetails.style.opacity = "0"
    layerDetails.hidden = false

    // Force reflow
    layerDetails.offsetHeight

    layerDetails.style.transition = "max-height 0.3s ease, opacity 0.3s ease"
    layerDetails.style.maxHeight = layerDetails.scrollHeight + "px"
    layerDetails.style.opacity = "1"
  } else {
    layerDetails.style.transition = "max-height 0.3s ease, opacity 0.3s ease"
    layerDetails.style.maxHeight = "0"
    layerDetails.style.opacity = "0"

    setTimeout(() => {
      layerDetails.hidden = true
      layerDetails.style.maxHeight = ""
      layerDetails.style.opacity = ""
      layerDetails.style.transition = ""
    }, 300)
  }
}

window.checkAnswer = (button, isCorrect) => {
  if (!button) return

  const quizOptions = document.querySelectorAll(".quiz-option")
  const feedbackDiv = utils.getElementById("quiz-feedback")

  if (!feedbackDiv) return

  // Disable all options
  quizOptions.forEach((option) => {
    option.disabled = true
    option.classList.remove("correct", "incorrect")
  })

  // Mark correct and incorrect answers
  if (isCorrect) {
    button.classList.add("correct")
    feedbackDiv.innerHTML = `
      <div class="feedback-correct">
        <strong>¡Correcto!</strong> Los routers operan en la Capa 3 (Red) del modelo OSI, 
        donde se encargan del enrutamiento y direccionamiento lógico de paquetes.
      </div>
    `
  } else {
    button.classList.add("incorrect")
    // Find and highlight the correct answer
    quizOptions.forEach((option) => {
      if (option.onclick && option.onclick.toString().includes("true")) {
        option.classList.add("correct")
      }
    })

    feedbackDiv.innerHTML = `
      <div class="feedback-incorrect">
        <strong>Incorrecto.</strong> Los routers operan en la Capa 3 (Red) del modelo OSI. 
        La respuesta correcta está marcada en verde.
      </div>
    `
  }

  feedbackDiv.classList.remove("hidden")

  // Reset quiz after 5 seconds
  setTimeout(() => {
    quizOptions.forEach((option) => {
      option.disabled = false
      option.classList.remove("correct", "incorrect")
    })
    feedbackDiv.classList.add("hidden")
    feedbackDiv.innerHTML = ""
  }, 5000)
}

const ProgressBar = {
  init() {
    this.progressBar = utils.getElementById("progressBar")
    if (this.progressBar) {
      this.updateProgress()
      utils.addEventListenerSafe(
        window,
        "scroll",
        utils.throttle(() => {
          this.updateProgress()
        }, 16),
      )
    }
  },

  updateProgress() {
    if (!this.progressBar) return

    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = (scrollTop / docHeight) * 100

    this.progressBar.style.width = Math.min(scrollPercent, 100) + "%"
  },
}

// ===== OSI SPECIFIC FUNCTIONS =====
window.showOSISection = (sectionId) => {
  // Hide all sections
  document.querySelectorAll(".osi-section-content").forEach((section) => {
    section.classList.add("osi-hidden")
  })

  // Show selected section
  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.classList.remove("osi-hidden")
    targetSection.classList.add("osi-fade-in")
  }

  // Update navigation buttons
  document.querySelectorAll(".osi-nav-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Find and activate the clicked button
  const clickedButton = event.target
  if (clickedButton) {
    clickedButton.classList.add("active")
  }
}

// OSI Layer toggle functionality
window.toggleOSILayer = (element) => {
  const details = element.querySelector(".osi-layer-details")
  const icon = element.querySelector(".osi-layer-toggle")

  if (details.classList.contains("osi-hidden")) {
    // Close all other layers
    document.querySelectorAll(".osi-layer-details").forEach((detail) => {
      detail.classList.add("osi-hidden")
    })
    document.querySelectorAll(".osi-layer-card").forEach((card) => {
      card.classList.remove("osi-layer-active")
    })
    document.querySelectorAll(".osi-layer-toggle").forEach((i) => {
      i.textContent = "+"
    })

    // Open this layer
    details.classList.remove("osi-hidden")
    details.classList.add("osi-fade-in")
    element.classList.add("osi-layer-active")
    icon.textContent = "−"
  } else {
    // Close this layer
    details.classList.add("osi-hidden")
    element.classList.remove("osi-layer-active")
    icon.textContent = "+"
  }
}

// ===== ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
  // You could send this to an error reporting service
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
  // You could send this to an error reporting service
})

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize all modules
    Navigation.init()
    ScrollManager.init()
    Animations.init()
    Accessibility.init()
    Performance.init()
    Search.init()
    ProgressBar.init()

    // Initialize OSI page if we're on it
    if (window.location.pathname.includes("modelo-osi.html")) {
      window.showOSISection("overview")
    }

    // Add CSS for blinking cursor animation and search highlight
    const style = document.createElement("style")
    style.textContent = `
      @keyframes blink {
        0%, 50% { border-color: transparent; }
        51%, 100% { border-color: currentColor; }
      }
      
      mark {
        background-color: yellow;
        padding: 0 2px;
        border-radius: 2px;
      }
    `
    document.head.appendChild(style)

    console.log("Redes de Datos website initialized successfully")
  } catch (error) {
    console.error("Error initializing website:", error)
  }
})

// ===== WINDOW LOAD EVENT =====
window.addEventListener("load", () => {
  // Apply typing effect to hero title
  const heroTitle = document.querySelector(".hero-title")
  if (heroTitle) {
    const originalText = heroTitle.textContent
    Animations.typeWriter(heroTitle, originalText, 150)
  }

  // Hide loading indicator if present
  const loadingIndicator = utils.getElementById("loading")
  if (loadingIndicator) {
    loadingIndicator.classList.remove("active")
  }
})

// ===== RESIZE HANDLER =====
window.addEventListener(
  "resize",
  utils.debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      Navigation.closeMobileMenu()
    }
  }, 250),
)


document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  const navLinks = navMenu.querySelectorAll('a');

  function openMenu() {
    hamburger.classList.add('active');
    navMenu.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hamburger.classList.contains('active')) closeMenu(); else openMenu();
  });

  navLinks.forEach(link => link.addEventListener('click', () => closeMenu()));

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
});


