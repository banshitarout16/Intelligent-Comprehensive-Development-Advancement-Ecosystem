const PISTON_BASE_URL = "https://emkc.org/api/v2/piston";

export const LANGUAGE_OPTIONS = [
  { key: "python", label: "Python", pistonLanguage: "python", fileName: "main.py" },
  { key: "javascript", label: "JavaScript", pistonLanguage: "javascript", fileName: "main.js" },
  { key: "typescript", label: "TypeScript", pistonLanguage: "typescript", fileName: "main.ts" },
  { key: "java", label: "Java", pistonLanguage: "java", fileName: "Main.java" },
  { key: "cpp", label: "C++", pistonLanguage: "cpp", fileName: "main.cpp" },
  { key: "c", label: "C", pistonLanguage: "c", fileName: "main.c" },
  { key: "csharp", label: "C#", pistonLanguage: "csharp", fileName: "Main.cs" },
  { key: "go", label: "Go", pistonLanguage: "go", fileName: "main.go" },
  { key: "ruby", label: "Ruby", pistonLanguage: "ruby", fileName: "main.rb" },
  { key: "php", label: "PHP", pistonLanguage: "php", fileName: "main.php" },
];

const findLanguageConfig = (languageKey) => {
  const config = LANGUAGE_OPTIONS.find((l) => l.key === languageKey);
  if (!config) {
    throw new Error(`Unsupported language: ${languageKey}`);
  }
  return config;
};

let runtimesCache = null;
let runtimesCachedAt = 0;
const RUNTIMES_CACHE_MS = 10 * 60 * 1000;

const getRuntimes = async () => {
  const now = Date.now();
  if (runtimesCache && now - runtimesCachedAt < RUNTIMES_CACHE_MS) {
    return runtimesCache;
  }

  const response = await fetch(`${PISTON_BASE_URL}/runtimes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Piston runtimes (${response.status})`);
  }

  runtimesCache = await response.json();
  runtimesCachedAt = now;
  return runtimesCache;
};

const resolveVersion = async (pistonLanguage) => {
  const runtimes = await getRuntimes();
  const match = runtimes.find((r) => r.language === pistonLanguage || r.aliases?.includes(pistonLanguage));
  if (!match) {
    throw new Error(`No available runtime for language: ${pistonLanguage}`);
  }
  return match.version;
};

export const executeCode = async ({ language, code, stdin = "" }) => {
  const config = findLanguageConfig(language);
  const version = await resolveVersion(config.pistonLanguage);

  const response = await fetch(`${PISTON_BASE_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: config.pistonLanguage,
      version,
      files: [{ name: config.fileName, content: code }],
      stdin,
      compile_timeout: 10000,
      run_timeout: 5000,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Code execution request failed (${response.status}): ${errBody.slice(0, 300)}`);
  }

  const data = await response.json();

  const compileFailed = data.compile && data.compile.code !== 0;
  return {
    stdout: data.run?.stdout || "",
    stderr: compileFailed ? data.compile.stderr || data.compile.output || "" : data.run?.stderr || "",
    exitCode: compileFailed ? data.compile.code : data.run?.code,
    compileFailed,
  };
};
