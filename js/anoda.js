// Inisialisasi AOS
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Lazy Loading dengan Intersection Observer
const lazyLoad = (targets) => {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                io.unobserve(img);
            }
        });
    }, {
        rootMargin: '0px 0px 100px 0px',
        threshold: 0.1
    });

    targets.forEach(img => io.observe(img));
};

lazyLoad(document.querySelectorAll('.lazy-img'));

// Smooth scroll untuk anchor link
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});