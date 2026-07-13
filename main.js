// --- Page Loader ---
const pageLoader = document.createElement('div');
pageLoader.id = 'page-loader';
pageLoader.innerHTML = '<div class="loader-spinner"></div>';
document.documentElement.appendChild(pageLoader);

window.addEventListener('load', () => {
    // Immediate smooth fade out on load
    pageLoader.classList.add('fade-out');
    setTimeout(() => pageLoader.remove(), 300);
});

// Utility to prevent XSS
const escapeHTML = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
};

// Render Data
document.addEventListener("DOMContentLoaded", () => {
    const skillsContainer = document.getElementById("skills-container");
    const projectsContainer = document.getElementById("projects-container");
    const testimonialsContainer = document.getElementById("testimonials-container");
    const blogContainer = document.getElementById("blog-container");

    if (typeof portfolioData !== 'undefined') {
        let allSkills = [];
        if (portfolioData.skills) allSkills = [...portfolioData.skills];
        
        const privateSkillsStr = localStorage.getItem('private_skills');
        if (privateSkillsStr) {
            try {
                const privateSkills = JSON.parse(privateSkillsStr);
                allSkills = [...allSkills, ...privateSkills];
            } catch(e) {}
        }

        if (allSkills.length > 0 && skillsContainer) {
            skillsContainer.innerHTML = '';
            allSkills.forEach(skill => {
                skillsContainer.innerHTML += `
                    <div class="card card-glow" style="${skill.isPrivate ? 'border-color: var(--primary-accent); position: relative;' : 'position: relative;'}">
                        ${skill.isPrivate ? '<div style="position:absolute; top: -10px; right: 10px; background: linear-gradient(45deg, var(--primary-accent), var(--secondary-accent)); padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; color: white;">Private</div>' : ''}
                        <h3>${escapeHTML(skill.name)}</h3>
                        <p style="color: var(--text-muted)">${escapeHTML(skill.category)}</p>
                        ${skill.isPrivate ? `<button class="delete-skill-btn" data-name="${escapeHTML(skill.name)}" style="display:inline-block; margin-top:1rem; background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 0.3rem 0.8rem; border-radius: 15px; cursor: pointer; font-size: 0.8rem;">Delete</button>` : ''}
                    </div>
                `;
            });
            
            document.querySelectorAll('.delete-skill-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const name = e.target.getAttribute('data-name');
                    let privs = JSON.parse(localStorage.getItem('private_skills') || '[]');
                    privs = privs.filter(s => s.name !== name);
                    localStorage.setItem('private_skills', JSON.stringify(privs));
                    window.location.reload();
                });
            });
        }

        let allProjects = [];
        if (portfolioData.projects) {
            allProjects = [...portfolioData.projects];
        }
        
        let deletedProjects = JSON.parse(localStorage.getItem('deleted_projects') || '[]');
        allProjects = allProjects.filter(p => !deletedProjects.includes(p.title));

        const privateProjectsStr = localStorage.getItem('private_projects');
        if (privateProjectsStr) {
            try {
                const privateProjects = JSON.parse(privateProjectsStr);
                privateProjects.forEach(priv => {
                    const index = allProjects.findIndex(p => p.title === priv.title);
                    if (index !== -1) {
                        allProjects[index] = priv;
                    } else {
                        allProjects.push(priv);
                    }
                });
            } catch(e) {}
        }

        if (allProjects.length > 0 && projectsContainer) {
            projectsContainer.innerHTML = '';
            allProjects.forEach(project => {
                const techString = Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies;
                projectsContainer.innerHTML += `
                    <div class="card card-glow project-card" style="${project.isPrivate ? 'border-color: var(--primary-accent); position: relative;' : 'position: relative;'}">
                        ${project.isPrivate ? '<div style="position:absolute; top: -10px; right: 10px; background: linear-gradient(45deg, var(--primary-accent), var(--secondary-accent)); padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; color: white;">Private</div>' : ''}
                        ${project.images && project.images.length > 0 ? `
                            <div class="project-gallery" style="display: flex; gap: 0.5rem; overflow-x: auto; margin-bottom: 1rem; padding-bottom: 0.5rem;">
                                ${project.images.map(img => `<a href="${img}" target="_blank"><img src="${img}" style="flex: 0 0 auto; width: 200px; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></a>`).join('')}
                            </div>
                        ` : (project.image ? `<img src="${project.image}" alt="${escapeHTML(project.title)}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem; object-fit: cover;">` : '<div class="project-img"></div>')}
                        <h3 class="project-title">${escapeHTML(project.title)}</h3>
                        <p class="project-tech">${escapeHTML(techString)}</p>
                        <p>${escapeHTML(project.description)}</p>
                        ${project.link && project.link !== '#' ? `<a href="${escapeHTML(project.link)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:1rem;" class="btn btn-secondary">View Project</a>` : ''}
                        ${(localStorage.getItem('isAdmin') === 'true') ? `
                            <button class="edit-private-btn" data-title="${escapeHTML(project.title)}" style="display:inline-block; margin-top:1rem; margin-left: 0.5rem; background: transparent; border: 1px solid var(--primary-accent); color: var(--primary-accent); padding: 1rem 1.5rem; border-radius: 30px; font-weight: 500; cursor: pointer; text-transform: uppercase; font-size: 0.9rem;">Edit</button>
                            <button class="delete-private-btn" data-title="${escapeHTML(project.title)}" style="display:inline-block; margin-top:1rem; margin-left: 0.5rem; background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 1rem 1.5rem; border-radius: 30px; font-weight: 500; cursor: pointer; text-transform: uppercase; font-size: 0.9rem;">Delete</button>
                        ` : ''}
                    </div>
                `;
            });
            
            document.querySelectorAll('.delete-private-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const title = e.target.getAttribute('data-title');
                    let deleted = JSON.parse(localStorage.getItem('deleted_projects') || '[]');
                    if (!deleted.includes(title)) deleted.push(title);
                    localStorage.setItem('deleted_projects', JSON.stringify(deleted));
                    
                    let privs = JSON.parse(localStorage.getItem('private_projects') || '[]');
                    privs = privs.filter(p => p.title !== title);
                    localStorage.setItem('private_projects', JSON.stringify(privs));
                    window.location.reload();
                });
            });

            document.querySelectorAll('.edit-private-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const title = e.target.getAttribute('data-title');
                    const project = allProjects.find(p => p.title === title);
                    if (project) {
                        document.getElementById('new-project-title').value = project.title;
                        document.getElementById('new-project-tech').value = Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies;
                        document.getElementById('new-project-desc').value = project.description;
                        document.getElementById('new-project-link').value = project.link;
                        if (document.getElementById('new-project-image')) {
                            document.getElementById('new-project-image').value = project.images ? project.images.join(', ') : '';
                        }
                        
                        window.editingProjectTitle = title;
                        
                        const modalTitle = document.querySelector('#add-project-modal h3');
                        if (modalTitle) modalTitle.innerText = "Edit Project";
                        
                        document.getElementById('add-project-modal').classList.add('show');
                    }
                });
            });
        }

        let allTests = [];
        if (portfolioData.testimonials) allTests = [...portfolioData.testimonials];
        
        const privateTestsStr = localStorage.getItem('private_testimonials');
        if (privateTestsStr) {
            try {
                const privateTests = JSON.parse(privateTestsStr);
                allTests = [...allTests, ...privateTests];
            } catch(e) {}
        }

        if (allTests.length > 0 && testimonialsContainer) {
            testimonialsContainer.innerHTML = '';
            allTests.forEach(test => {
                testimonialsContainer.innerHTML += `
                    <div class="card card-glow testimonial-card" style="${test.isPrivate ? 'border-color: var(--primary-accent); position: relative;' : 'position: relative;'}">
                        ${test.isPrivate ? '<div style="position:absolute; top: -10px; right: 10px; background: linear-gradient(45deg, var(--primary-accent), var(--secondary-accent)); padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; color: white;">Private</div>' : ''}
                        <p>"${escapeHTML(test.content)}"</p>
                        <p class="author">${escapeHTML(test.author)}</p>
                        <p class="role">${escapeHTML(test.role)}, ${escapeHTML(test.company)}</p>
                        ${test.isPrivate ? `<button class="delete-test-btn" data-author="${escapeHTML(test.author)}" style="display:inline-block; margin-top:1rem; background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 0.3rem 0.8rem; border-radius: 15px; cursor: pointer; font-size: 0.8rem;">Delete</button>` : ''}
                    </div>
                `;
            });

            document.querySelectorAll('.delete-test-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const author = e.target.getAttribute('data-author');
                    let privs = JSON.parse(localStorage.getItem('private_testimonials') || '[]');
                    privs = privs.filter(t => t.author !== author);
                    localStorage.setItem('private_testimonials', JSON.stringify(privs));
                    window.location.reload();
                });
            });
        } else if (testimonialsContainer) {
            testimonialsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0;"><h3 style="color: var(--text-muted); font-weight: normal; font-size: 1.5rem; letter-spacing: 2px; text-transform: uppercase;">Coming Soon</h3><p style="color: var(--text-muted); margin-top: 1rem;">Testimonials will be added here shortly.</p></div>';
            testimonialsContainer.classList.remove('grid-2');
        }

        let allBlogs = [];
        if (portfolioData.blogs) allBlogs = [...portfolioData.blogs];
        
        const privateBlogsStr = localStorage.getItem('private_blogs');
        if (privateBlogsStr) {
            try {
                const privateBlogs = JSON.parse(privateBlogsStr);
                allBlogs = [...allBlogs, ...privateBlogs];
            } catch(e) {}
        }
        
        if (allBlogs.length > 0 && blogContainer) {
            blogContainer.innerHTML = '';
            blogContainer.classList.add('grid-2');
            allBlogs.forEach(blog => {
                blogContainer.innerHTML += `
                    <div class="card card-glow" style="${blog.isPrivate ? 'border-color: var(--primary-accent); position: relative;' : 'position: relative;'}">
                        ${blog.isPrivate ? '<div style="position:absolute; top: -10px; right: 10px; background: linear-gradient(45deg, var(--primary-accent), var(--secondary-accent)); padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; color: white;">Private</div>' : ''}
                        ${blog.image ? `<img src="${escapeHTML(blog.image)}" alt="${escapeHTML(blog.title)}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem; object-fit: cover;">` : ''}
                        <h3 style="color: var(--text-color); margin-bottom: 0.5rem;">${escapeHTML(blog.title)}</h3>
                        <p style="color: var(--primary-accent); font-size: 0.85rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px;">${escapeHTML(blog.category)}</p>
                        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap;">${escapeHTML(blog.content)}</p>
                        ${blog.isPrivate ? `<button class="delete-blog-btn" data-title="${escapeHTML(blog.title)}" style="display:inline-block; margin-top:1rem; background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 0.3rem 0.8rem; border-radius: 15px; cursor: pointer; font-size: 0.8rem;">Delete</button>` : ''}
                    </div>
                `;
            });
            
            document.querySelectorAll('.delete-blog-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const title = e.target.getAttribute('data-title');
                    let privs = JSON.parse(localStorage.getItem('private_blogs') || '[]');
                    privs = privs.filter(b => b.title !== title);
                    localStorage.setItem('private_blogs', JSON.stringify(privs));
                    window.location.reload();
                });
            });
        } else if (blogContainer) {
            blogContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0;"><h3 style="color: var(--text-muted); font-weight: normal; font-size: 1.5rem; letter-spacing: 2px; text-transform: uppercase;">Coming Soon</h3><p style="color: var(--text-muted); margin-top: 1rem;">Exciting blogs and AI prompts will be added here shortly.</p></div>';
            blogContainer.classList.remove('grid-2');
        }
    }

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    const themeIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/>
    </svg>`;

    const setDarkIcon = () => { 
        if(themeToggleBtn) {
            themeToggleBtn.innerHTML = `<span style="display:flex; align-items:center; gap:0.5rem; transform: rotate(180deg); transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);">${themeIconSVG} <span style="font-size: 1.05rem;">Dark Theme</span></span>`; 
        }
    };
    
    const setLightIcon = () => { 
        if(themeToggleBtn) {
            themeToggleBtn.innerHTML = `<span style="display:flex; align-items:center; gap:0.5rem; transform: rotate(0deg); transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);">${themeIconSVG} <span style="font-size: 1.05rem;">Light Theme</span></span>`; 
        }
    };

    if (currentTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        setLightIcon();
    } else {
        setDarkIcon();
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                setDarkIcon();
            } else {
                document.body.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                setLightIcon();
            }
        });
    }

    // Action Modal Logic
    const actionModal = document.getElementById('action-modal');
    const actionForm = document.getElementById('action-form');
    const closeBtn = document.querySelector('.close-modal');
    
    if (actionModal) {
        const triggers = document.querySelectorAll('.action-modal-trigger');
        const typeInput = document.getElementById('action-type');
        const targetInput = document.getElementById('action-target');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const type = trigger.getAttribute('data-type');
                const target = trigger.getAttribute('data-target');
                
                typeInput.value = type;
                targetInput.value = target;
                
                actionModal.classList.add('show');
            });
        });
        
        closeBtn.addEventListener('click', () => {
            actionModal.classList.remove('show');
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === actionModal) {
                actionModal.classList.remove('show');
            }
        });
        
        actionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = actionForm.querySelector('.submit-btn');
            const originalContent = btn.innerHTML;
            
            btn.innerHTML = '<span>Redirecting...</span>';
            
            const type = typeInput.value;
            const target = targetInput.value;
            const name = document.getElementById('action-name').value;
            const purpose = document.getElementById('action-purpose').value;
            
            const messageText = `Hi, I am ${name}.\n${purpose}`;
            
            if (type === 'email') {
                const subject = encodeURIComponent("Contact from Portfolio: " + name);
                const body = encodeURIComponent(messageText);
                const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${target}&su=${subject}&body=${body}`;
                window.open(gmailLink, '_blank');
            } else if (type === 'whatsapp') {
                const waLink = `https://wa.me/${target}?text=${encodeURIComponent(messageText)}`;
                window.open(waLink, '_blank');
            }
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                actionForm.reset();
                actionModal.classList.remove('show');
            }, 1000);
        });
    }

    // Admin Logic via secret keyword command
    let keyBuffer = '';
    const secretWord = 'login2301pradeep';
    document.addEventListener('keydown', (e) => {
        // Only track single character presses when not in an input
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            keyBuffer += e.key.toLowerCase();
            if (keyBuffer.length > secretWord.length) keyBuffer = keyBuffer.slice(-secretWord.length);
            
            if (keyBuffer === secretWord) {
                const currentStatus = localStorage.getItem('isAdmin') === 'true';
                if (currentStatus) {
                    if (confirm("You are currently in Admin Mode. Do you want to logout?")) {
                        localStorage.setItem('isAdmin', 'false');
                        window.location.reload();
                    }
                } else {
                    const pass = prompt("Enter Admin Password:");
                    if (pass === "@23harsh#jan") {
                        localStorage.setItem('isAdmin', 'true');
                        alert("Admin Mode Enabled!");
                        window.location.reload();
                    } else if (pass !== null) {
                        alert("Incorrect Password!");
                    }
                }
                keyBuffer = '';
            }
        }
    });

    const isLocalAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Add Project Logic
    const addProjectBtn = document.getElementById('add-project-btn');
    const addProjectModal = document.getElementById('add-project-modal');
    const addProjectForm = document.getElementById('add-project-form');
    
    if (addProjectBtn && isLocalAdmin) {
        addProjectBtn.style.display = 'inline-block';
        
        addProjectBtn.addEventListener('click', () => {
            window.editingProjectTitle = null;
            if (document.getElementById('add-project-form')) document.getElementById('add-project-form').reset();
            const modalTitle = document.querySelector('#add-project-modal h3');
            if (modalTitle) modalTitle.innerText = "Add New Project";
            addProjectModal.classList.add('show');
        });
        
        if (addProjectModal) {
            const closeProjModal = addProjectModal.querySelector('.close-project-modal');
            closeProjModal.addEventListener('click', () => {
                addProjectModal.classList.remove('show');
            });
        }
        
        if (addProjectForm) {
            addProjectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('new-project-title').value;
                const tech = document.getElementById('new-project-tech').value.split(',').map(s => s.trim());
                const desc = document.getElementById('new-project-desc').value;
                const link = document.getElementById('new-project-link').value;
                const imgInput = document.getElementById('new-project-image') ? document.getElementById('new-project-image').value : '';
                let images = [];
                if (imgInput) {
                    images = imgInput.split(',').map(s => s.trim()).filter(s => s);
                }
                
                const newProject = {
                    title: title,
                    technologies: tech,
                    description: desc,
                    link: link,
                    images: images,
                    isPrivate: true
                };
                
                let privs = JSON.parse(localStorage.getItem('private_projects') || '[]');
                if (window.editingProjectTitle) {
                    const index = privs.findIndex(p => p.title === window.editingProjectTitle);
                    if (index !== -1) {
                        privs[index] = newProject;
                    } else {
                        privs.push(newProject);
                    }
                    if (window.editingProjectTitle !== newProject.title) {
                        let deleted = JSON.parse(localStorage.getItem('deleted_projects') || '[]');
                        if (!deleted.includes(window.editingProjectTitle)) deleted.push(window.editingProjectTitle);
                        localStorage.setItem('deleted_projects', JSON.stringify(deleted));
                    }
                    window.editingProjectTitle = null;
                } else {
                    privs.push(newProject);
                }
                localStorage.setItem('private_projects', JSON.stringify(privs));
                
                addProjectModal.classList.remove('show');
                addProjectForm.reset();
                window.location.reload();
            });
        }
    }
    
    // Add Skill Logic
    const addSkillBtn = document.getElementById('add-skill-btn');
    const addSkillModal = document.getElementById('add-skill-modal');
    const addSkillForm = document.getElementById('add-skill-form');
    
    if (addSkillBtn && isLocalAdmin) {
        addSkillBtn.style.display = 'inline-block';
        
        addSkillBtn.addEventListener('click', () => {
            addSkillModal.classList.add('show');
        });
        
        if (addSkillModal) {
            const closeSkillModal = addSkillModal.querySelector('.close-skill-modal');
            closeSkillModal.addEventListener('click', () => {
                addSkillModal.classList.remove('show');
            });
        }
        
        if (addSkillForm) {
            addSkillForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('new-skill-name').value;
                const cat = document.getElementById('new-skill-cat').value;
                
                const newSkill = {
                    name: name,
                    category: cat,
                    isPrivate: true
                };
                
                let privs = JSON.parse(localStorage.getItem('private_skills') || '[]');
                privs.push(newSkill);
                localStorage.setItem('private_skills', JSON.stringify(privs));
                
                addSkillModal.classList.remove('show');
                addSkillForm.reset();
                window.location.reload();
            });
        }
    }

    // Add Testimonial Logic
    const addTestBtn = document.getElementById('add-test-btn');
    const addTestModal = document.getElementById('add-test-modal');
    const addTestForm = document.getElementById('add-test-form');
    
    if (addTestBtn && isLocalAdmin) {
        addTestBtn.style.display = 'inline-block';
        
        addTestBtn.addEventListener('click', () => {
            addTestModal.classList.add('show');
        });
        
        if (addTestModal) {
            const closeTestModal = addTestModal.querySelector('.close-test-modal');
            closeTestModal.addEventListener('click', () => {
                addTestModal.classList.remove('show');
            });
        }
        
        if (addTestForm) {
            addTestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const author = document.getElementById('new-test-author').value;
                const role = document.getElementById('new-test-role').value;
                const comp = document.getElementById('new-test-company').value;
                const content = document.getElementById('new-test-content').value;
                
                const newTest = {
                    author: author,
                    role: role,
                    company: comp,
                    content: content,
                    isPrivate: true
                };
                
                let privs = JSON.parse(localStorage.getItem('private_testimonials') || '[]');
                privs.push(newTest);
                localStorage.setItem('private_testimonials', JSON.stringify(privs));
                
                addTestModal.classList.remove('show');
                addTestForm.reset();
                window.location.reload();
            });
        }
    }

    // Add Blog Logic
    const addBlogBtn = document.getElementById('add-blog-btn');
    const addBlogModal = document.getElementById('add-blog-modal');
    const addBlogForm = document.getElementById('add-blog-form');
    
    if (addBlogBtn && isLocalAdmin) {
        addBlogBtn.style.display = 'inline-block';
        
        addBlogBtn.addEventListener('click', () => {
            addBlogModal.classList.add('show');
        });
        
        if (addBlogModal) {
            const closeBlogModal = addBlogModal.querySelector('.close-blog-modal');
            closeBlogModal.addEventListener('click', () => {
                addBlogModal.classList.remove('show');
            });
        }
        
        if (addBlogForm) {
            addBlogForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('new-blog-title').value;
                const cat = document.getElementById('new-blog-category').value;
                const link = document.getElementById('new-blog-link').value;
                const content = document.getElementById('new-blog-content').value;
                
                const newBlog = {
                    title: title,
                    category: cat,
                    image: link,
                    content: content,
                    isPrivate: true
                };
                
                let privs = JSON.parse(localStorage.getItem('private_blogs') || '[]');
                privs.push(newBlog);
                localStorage.setItem('private_blogs', JSON.stringify(privs));
                
                addBlogModal.classList.remove('show');
                addBlogForm.reset();
                alert('Blog/Prompt saved locally!');
                window.location.reload();
            });
        }
    }

    // Add Mobile Menu Toggle Logic
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.setAttribute('aria-label', 'Toggle menu');
    document.body.appendChild(mobileMenuBtn);

    const sidebar = document.querySelector('.sidebar');

    if (sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            if (sidebar.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '✕';
            } else {
                mobileMenuBtn.innerHTML = '☰';
            }
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                    mobileMenuBtn.innerHTML = '☰';
                }
            }
        });

        // Close sidebar when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('active');
                    mobileMenuBtn.innerHTML = '☰';
                }
            });
        });
    }
});

// Google Analytics Setup
(function() {
    // TODO: Replace 'G-XXXXXXXXXX' with your actual Google Analytics Measurement ID
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
    
    // Only load GA if the placeholder has been replaced
    if (GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
        `;
        document.head.appendChild(script2);
        console.log("Google Analytics is actively tracking.");
    } else {
        console.log("Google Analytics is set up but paused. Please update 'GA_MEASUREMENT_ID' in main.js with your real ID.");
    }
})();

// --- Massive Animation & Effects Upgrade ---
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Custom Cursor
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.querySelectorAll('a, button, .card, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // 2. Auto-inject animation classes (saves modifying HTML files)
    document.querySelectorAll('.card').forEach((el, index) => {
        el.classList.add('animate-on-scroll', 'animate-slide-up', 'tilt-card');
        el.style.transitionDelay = `${(index % 4) * 0.1}s`;
    });
    
    document.querySelectorAll('.section-title').forEach(el => {
        el.classList.add('animate-on-scroll', 'animate-zoom-in');
    });

    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.add('btn-bounce', 'ripple-effect');
        
        // Ripple Effect
        btn.addEventListener('click', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            
            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.classList.add('ripple');
            this.appendChild(ripples);
            
            setTimeout(() => {
                ripples.remove();
            }, 600);
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // 3. 3D Tilt Effect on Cards
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            setTimeout(() => { card.style.transition = ''; }, 300);
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // 4. Page Zoom Transition
    const mainContent = document.querySelector('.main-content');
    const sidebarElement = document.querySelector('.sidebar');
    
    // Apply enter animation on load
    if (mainContent) mainContent.classList.add('page-zoom-transition-enter');

    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && link.target !== '_blank' && !link.href.includes('#')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove enter, add exit
                if (mainContent) {
                    mainContent.classList.remove('page-zoom-transition-enter');
                    mainContent.classList.add('page-zoom-transition-exit');
                }
                if (sidebarElement && window.innerWidth > 992) {
                    sidebarElement.classList.add('page-zoom-transition-exit');
                }
                
                setTimeout(() => {
                    window.location = link.href;
                }, 400); // Matches the 0.45s animation duration
            });
        }
    });

    // 5. Typewriter Effect for Hero Tagline
    const tagline = document.querySelector('.hero-tagline');
    if (tagline && !tagline.dataset.typed) {
        tagline.dataset.typed = 'true';
        const text = tagline.innerText;
        tagline.innerText = '';
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                tagline.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        setTimeout(typeWriter, 1200); // Wait for text reveal animation
    }

    // 6. Sidebar Navigation Icons Injection
    const navIcons = {
        'Home': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/><path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/></svg>',
        'About': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/></svg>',
        'Resume': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.5 9a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4z"/></svg>',
        'Skills': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/></svg>',
        'Projects': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/></svg>',
        'Testimonials': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/></svg>',
        'Blog & AI': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"/></svg>',
        'Contact': '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-.394A10.024 10.024 0 0 0 10 11.894V11.5A1.5 1.5 0 0 1 11.5 10h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 10 14.5v-.394a10.025 10.025 0 0 1-4.894-4.894H5.5A1.5 1.5 0 0 1 4 7.5v-3z"/></svg>'
    };

    document.querySelectorAll('.nav-links a').forEach(a => {
        const text = a.innerText.trim();
        if (navIcons[text] && !a.innerHTML.includes('<svg')) {
            a.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.8rem;">${navIcons[text]} <span style="font-size:1.05rem;">${text}</span></span>`;
        }
    });

    // 7. Floating WhatsApp Widget
    const waWidget = document.createElement('a');
    waWidget.href = "https://wa.me/YOUR_PHONE_NUMBER_HERE"; // User can change this later
    waWidget.className = 'floating-wa float-anim';
    waWidget.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
    </svg>`;
    waWidget.target = "_blank";
    waWidget.setAttribute('aria-label', 'Chat on WhatsApp');
    document.body.appendChild(waWidget);

    // 8. Top Scroll Progress Bar
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);

    // 9. Back-to-Top Button
    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.innerHTML = '<svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/></svg>';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);

    // 10. Background Glowing Blobs
    const blob1 = document.createElement('div');
    blob1.className = 'bg-blob blob-1';
    const blob2 = document.createElement('div');
    blob2.className = 'bg-blob blob-2';
    document.body.appendChild(blob1);
    document.body.appendChild(blob2);

    // 10.5 Distinct Floating Background Circles
    const createFloatingCircle = (size, top, left, delay, duration, border) => {
        const circle = document.createElement('div');
        circle.className = 'floating-circle';
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.top = top + '%';
        circle.style.left = left + '%';
        circle.style.animationDelay = delay + 's';
        circle.style.animationDuration = duration + 's';
        if (border) {
            circle.style.border = `2px solid var(--primary-accent)`;
            circle.style.background = 'transparent';
        } else {
            circle.style.background = 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))';
        }
        document.body.appendChild(circle);
    };

    createFloatingCircle(150, 15, 85, 0, 18, true);
    createFloatingCircle(80, 75, 10, 2, 14, false);
    createFloatingCircle(220, 80, 80, 4, 22, true);
    createFloatingCircle(40, 25, 15, 1, 10, false);

    window.addEventListener('scroll', () => {
        // Scroll Progress logic
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';

        // Back to Top visibility
        if (winScroll > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 11. Animated Counters
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetNum = parseInt(target.getAttribute('data-target') || target.innerText.replace(/\D/g, ''), 10);
                if (targetNum) {
                    let count = 0;
                    const speed = 2000 / targetNum; // Total animation 2 seconds
                    const updateCount = () => {
                        count += Math.ceil(targetNum / 100);
                        if (count < targetNum) {
                            target.innerText = count;
                            setTimeout(updateCount, speed > 10 ? speed : 10);
                        } else {
                            target.innerText = targetNum + (target.getAttribute('data-suffix') || '');
                        }
                    };
                    updateCount();
                    observer.unobserve(target);
                }
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));

    // 12. Contact Form Shake Animation on Invalid Submit
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let valid = true;
            form.querySelectorAll('input[required], textarea[required]').forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.classList.remove('shake-anim');
                    // trigger reflow
                    void input.offsetWidth;
                    input.classList.add('shake-anim');
                }
            });
            if (!valid) {
                e.preventDefault();
            }
        });
    });
});
