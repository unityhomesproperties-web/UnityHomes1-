with open('src/components/WaitlistModal.tsx', 'r') as f:
    content = f.read()

# Let's find the unclosed {currentStep > 0 && (
if '{currentStep > 0 && (' in content:
    print("Found {currentStep > 0 && (")
else:
    print("Not found {currentStep > 0 && (")

# The issue is we replaced the top `{currentStep > 0 && (` with `<div className="py-8 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col overflow-y-auto">`
# But we missed removing the matching `)}` at the end!
content = content.replace('        )}\n      </div>\n    </div>\n  );\n}', '      </div>\n    </div>\n  );\n}')
content = content.replace('        )}\n      </div>\n    </div>\n    </div>\n  );\n}', '      </div>\n    </div>\n    </div>\n  );\n}')

# Wait, let's just make sure it compiles. I will replace the whole end block.
import re
content = re.sub(r'\}\)\}\s*</div>\s*</motion\.div>\s*</div>\s*</div>\s*\)\}\s*</div>\s*</div>\s*</div>\s*\);\s*\}', r'}\n                  </button>\n                </div>\n              </motion.div>\n            </div>\n          </div>\n      </div>\n    </div>\n    </div>\n  );\n}', content)

with open('src/components/WaitlistModal.tsx', 'w') as f:
    f.write(content)
