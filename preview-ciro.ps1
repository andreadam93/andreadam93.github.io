$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$url = "http://127.0.0.1:8000/"

function Test-CiroPreview {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

if (-not (Test-CiroPreview)) {
    $bundledPython = "C:\Users\andre\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if (Test-Path -LiteralPath $bundledPython) {
        $python = $bundledPython
    }
    else {
        $pythonCandidates = @(
            (Get-Command py -ErrorAction SilentlyContinue),
            (Get-Command python -ErrorAction SilentlyContinue),
            (Get-Command python3 -ErrorAction SilentlyContinue)
        ) | Where-Object { $_ }

        if (-not $pythonCandidates) {
            throw "Python was not found. Install Python or use the GitHub Codespaces preview."
        }

        $python = $pythonCandidates[0].Source
    }

    $serverScript = Join-Path $root "preview-server.py"
    $docsDirectory = Join-Path $root "docs"
    Start-Process -FilePath $python -ArgumentList @(
        "`"$serverScript`"", "8000",
        "--bind", "127.0.0.1",
        "--directory", "`"$docsDirectory`""
    ) -WorkingDirectory $root -WindowStyle Hidden

    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        if (Test-CiroPreview) {
            $ready = $true
            break
        }
    }

    if (-not $ready) {
        throw "The CIRO preview server did not start on port 8000."
    }
}

$code = Get-Command code -ErrorAction SilentlyContinue
if ($code) {
    & $code.Source --reuse-window --open-url $url
}
else {
    Start-Process $url
}
