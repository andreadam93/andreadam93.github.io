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
    $pythonCandidates = @(
        (Get-Command py -ErrorAction SilentlyContinue),
        (Get-Command python -ErrorAction SilentlyContinue),
        (Get-Command python3 -ErrorAction SilentlyContinue)
    ) | Where-Object { $_ }

    $bundledPython = "C:\Users\andre\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if ((-not $pythonCandidates) -and (Test-Path -LiteralPath $bundledPython)) {
        $pythonCandidates = @([PSCustomObject]@{ Source = $bundledPython })
    }

    if (-not $pythonCandidates) {
        throw "Python was not found. Install Python or use the GitHub Codespaces preview."
    }

    $python = $pythonCandidates[0].Source
    Start-Process -FilePath $python -ArgumentList @(
        "-m", "http.server", "8000",
        "--bind", "127.0.0.1",
        "--directory", "docs"
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
