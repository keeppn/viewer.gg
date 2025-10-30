import os
import re

# Base path
base_path = r"C:\Users\RadostinAngelov\viewer.gg\web\src\components\pages"

# Files to update
files = [
    "Analytics.tsx",
    "Applications.tsx",
    "Apply.tsx",
    "Live.tsx",
    "NewTournament.tsx",
    "Reports.tsx",
    "Settings.tsx",
    "Tournaments.tsx"
]

for filename in files:
    filepath = os.path.join(base_path, filename)
    
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add "use client" at the top if not present
    if not content.startswith('"use client"') and not content.startswith("'use client'"):
        content = '"use client";\n\n' + content
    
    # Replace react-router imports with next imports
    content = re.sub(
        r"import\s+\{[^}]*useNavigate[^}]*\}\s+from\s+['\"]react-router-dom['\"];?",
        "import { useRouter } from 'next/navigation';",
        content
    )
    
    content = re.sub(
        r"import\s+\{[^}]*useOutletContext[^}]*\}\s+from\s+['\"]react-router-dom['\"];?",
        "",
        content
    )
    
    content = re.sub(
        r"import\s+\{[^}]*useParams[^}]*\}\s+from\s+['\"]react-router-dom['\"];?",
        "import { useParams, useRouter } from 'next/navigation';",
        content
    )
    
    # Replace useNavigate with useRouter
    content = re.sub(r"const navigate = useNavigate\(\);?", "const router = useRouter();", content)
    content = re.sub(r"navigate\((['\"][^'\"]+['\"])\)", r"router.push(\1)", content)
    
    # Replace relative imports with @ imports
    content = re.sub(r"from ['\"]\.\.\/", "from '@/", content)
    content = re.sub(r"from ['\"]\.\/", "from '@/components/", content)
    
    # Replace useOutletContext with useAppStore/useAuthStore
    content = re.sub(
        r"const \{ ([^}]+) \} = useOutletContext<[^>]+>\(\);?",
        lambda m: f"const {{ {m.group(1)} }} = useAppStore();",
        content
    )
    
    # Add store imports if useAppStore is used and not imported
    if "useAppStore()" in content and "from '@/store/appStore'" not in content:
        # Find the last import statement
        import_match = re.search(r"(import [^;]+;)\n", content)
        if import_match:
            last_import_pos = import_match.end()
            content = content[:last_import_pos] + "import { useAppStore } from '@/store/appStore';\n" + content[last_import_pos:]
    
    # Write the updated content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated: {filename}")

print("All files updated successfully!")
