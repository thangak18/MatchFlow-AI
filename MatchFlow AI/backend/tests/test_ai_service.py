import json
from unittest.mock import MagicMock, patch

from app.schemas.schemas import StartupProfileSchema
from app.services.ai_service import extract_startup_profile


@patch('app.services.ai_service.get_client')
def test_successful_structured_extraction(mock_get_client, tmp_path):
    # Mock the Gemini client and file upload
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_file = MagicMock()
    mock_file.name = "mocked_file_id"
    mock_client.files.upload.return_value = mock_file
    
    # Mock a perfect structured JSON response from Gemini
    mock_response = MagicMock()
    valid_json = json.dumps({
        "company_name": "LogiSense AI",
        "industry": "Logistics",
        "stage": "Seed",
        "funding_requirement": 500000.0
    })
    mock_response.text = valid_json
    mock_client.models.generate_content.return_value = mock_response
    
    # Create a fake PDF file
    fake_pdf = tmp_path / "pitch.pdf"
    fake_pdf.write_text("fake content")
    
    # Run the extraction
    result = extract_startup_profile(str(fake_pdf))
    
    # Validate the structured output parsed perfectly
    assert result is not None
    assert isinstance(result, StartupProfileSchema)
    assert result.industry == "Logistics"
    assert result.stage == "Seed"
    assert result.funding_requirement == 500000.0
    
    # Verify cleanup occurred
    mock_client.files.delete.assert_called_once_with(name="mocked_file_id")

@patch('app.services.ai_service.get_client')
def test_failed_schema_validation(mock_get_client, tmp_path):
    # Mock Gemini returning completely malformed JSON
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_file = MagicMock()
    mock_file.name = "mocked_file_id"
    mock_client.files.upload.return_value = mock_file
    
    mock_response = MagicMock()
    # "funding_requirement" should be a float, but we pass a nested object to force ValidationError
    invalid_json = json.dumps({
        "company_name": "LogiSense AI",
        "funding_requirement": {"invalid": "type"}
    })
    mock_response.text = invalid_json
    mock_client.models.generate_content.return_value = mock_response
    
    fake_pdf = tmp_path / "pitch.pdf"
    fake_pdf.write_text("fake content")
    
    result = extract_startup_profile(str(fake_pdf))
    
    # It must gracefully return None rather than crashing
    assert result is None
    
@patch('app.services.ai_service.get_client')
def test_api_failure_handling(mock_get_client, tmp_path):
    # Mock Gemini throwing an API error (e.g. rate limit or auth error)
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_file = MagicMock()
    mock_client.files.upload.return_value = mock_file
    
    mock_client.models.generate_content.side_effect = Exception("Google API Rate Limit Exceeded")
    
    fake_pdf = tmp_path / "pitch.pdf"
    fake_pdf.write_text("fake content")
    
    result = extract_startup_profile(str(fake_pdf))
    
    # It must gracefully return None
    assert result is None
