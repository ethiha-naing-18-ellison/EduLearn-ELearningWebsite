# Test script to upload a PDF file to the documents endpoint
$filePath = "C:\path\to\your\ilovepdf_merged.pdf"  # Replace with actual path
$apiUrl = "http://localhost:5000/api/documents/upload"

# Create form data
$form = @{
    Title = "What is web design"
    Description = "Hello"
    CourseId = 1
    IsFree = $true
    DocumentType = "PDF"
    FileFormat = "PDF"
    PageCount = 1
    Order = 1
}

# Add file if it exists
if (Test-Path $filePath) {
    $file = Get-Item $filePath
    $form.Add("documentFile", $file)
    Write-Host "Uploading file: $($file.FullName)"
} else {
    Write-Host "File not found: $filePath"
    Write-Host "Please update the filePath variable with the correct path to your PDF file"
    exit
}

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Form $form
    Write-Host "Upload successful!"
    Write-Host "Document ID: $($response.id)"
    Write-Host "Document File: $($response.documentFile)"
} catch {
    Write-Host "Upload failed: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
