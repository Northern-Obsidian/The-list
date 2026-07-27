# Testing Strategy

## Testing Levels

### Unit Tests (Vitest)
```
src/
├── services/
│   ├── __tests__/
│   │   ├── progress-engine.test.ts
│   │   ├── stats-engine.test.ts
│   │   ├── achievement-engine.test.ts
│   │   ├── recommendation-engine.test.ts
│   │   └── random-picker.test.ts
│   └── utils/
│       ├── __tests__/
│       │   ├── format.test.ts
│       │   ├── validation.test.ts
│       │   └── date.test.ts
```

### Test Coverage Targets
- **Services**: 90%+ (business logic is critical)
- **Utils**: 80%+ (formatting, validation)
- **Hooks**: 70%+ (data access patterns)
- **Components**: 60%+ (UI is harder to test exhaustively)

### What to Test

#### Progress Engine
```typescript
describe('ProgressEngine', () => {
  it('calculates 0% for unwatched series');
  it('calculates 100% for fully watched series');
  it('handles partial season completion');
  it('auto-advances to next episode');
  it('auto-advances to next season');
  it('marks series completed on final episode');
  it('handles filler/special episode exclusion');
  it('calculates remaining episodes correctly');
  it('preserves progress on rewatch');
});
```

#### Stats Engine
```typescript
describe('StatsEngine', () => {
  it('counts total movies');
  it('calculates total watch hours');
  it('computes longest streak');
  it('computes current streak');
  it('identifies most watched genre');
  it('calculates genre percentages');
  it('handles empty library');
  it('handles single entry');
});
```

#### Achievement Engine
```typescript
describe('AchievementEngine', () => {
  it('unlocks first movie on first movie');
  it('unlocks 100 movies at milestone');
  it('does not re-unlock already earned');
  it('handles secret achievements');
  it('reports progress correctly');
});
```

#### Validation
```typescript
describe('Validation Schemas', () => {
  it('validates correct media entry');
  it('rejects missing required fields');
  it('validates rating ranges (1-10)');
  it('validates media types enum');
  it('validates import JSON format');
  it('sanitizes text inputs');
});
```

### Integration Tests

Test critical user flows end-to-end:
- Add movie → appears in library
- Add series → add season → add episode → mark watched → progress updates
- Create collection → add media → collection shows correct count
- Search → filter by type → correct results
- Switch profile → isolated data

### Manual Testing Checklist

```
Pre-release checklist:
□ Fresh install works
□ All 13 media types can be added
□ Series with 10+ seasons renders correctly
□ Search handles 1000+ items
□ Theme switching works without crash
□ Backup → restore preserves all data
□ Import → export → reimport maintains integrity
□ Calendar renders all months correctly
□ Widget displays current progress
□ App lock works (biometric + PIN)
□ Multi-profile data isolation
□ Notifications fire at correct times
□ Performance test with 10,000 media items
□ Large poster images load without crash
□ Memory usage under 200MB
```

## Testing Tools

- **Vitest**: Unit and integration tests
- **React Native Testing Library**: Component tests
- **Expo's test utilities**: Native module mocking
- **Manual testing**: Physical devices (iOS + Android)

## CI Pipeline

```yaml
# .github/workflows/test.yml
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx expo test
      - run: npx tsc --noEmit
```
