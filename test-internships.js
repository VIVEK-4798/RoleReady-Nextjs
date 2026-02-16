// Native fetch used

const JOINRISE_BASE_URL = 'https://api.joinrise.io/api/v1';

async function testJoinRise() {
    const combinedQuery = 'Internship India';
    const params = new URLSearchParams({
        page: '1',
        limit: '20',
        search: combinedQuery
    });

    console.log(`Fetching from JoinRise: ${JOINRISE_BASE_URL}/jobs/public?${params.toString()}`);
    const response = await fetch(`${JOINRISE_BASE_URL}/jobs/public?${params.toString()}`);
    const json = await response.json();
    console.log(`Raw results: ${json.result?.jobs?.length || 0}`);

    if (json.result?.jobs?.length === 0) {
        console.log("Trying fallback 'Internship'...");
        const fallbackParams = new URLSearchParams({ page: '1', limit: '20', search: 'Internship' });
        const fallbackRes = await fetch(`${JOINRISE_BASE_URL}/jobs/public?${fallbackParams.toString()}`);
        const fallbackJson = await fallbackRes.json();
        console.log(`Fallback results: ${fallbackJson.result?.jobs?.length || 0}`);
    }
}

async function testArbeitnow() {
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api?page=1');
    const json = await response.json();
    const raw = json.data || [];
    console.log(`Arbeitnow raw count: ${raw.length}`);
    const filtered = raw.filter(j =>
        j.title.toLowerCase().includes('intern') ||
        j.description.toLowerCase().includes('intern')
    );
    console.log(`Arbeitnow filtered (intern): ${filtered.length}`);
}

async function run() {
    await testJoinRise();
    await testArbeitnow();
}

run();
