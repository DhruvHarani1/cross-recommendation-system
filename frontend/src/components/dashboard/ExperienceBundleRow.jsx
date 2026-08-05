import ContentRow from './ContentRow';

export default function ExperienceBundleRow({ bundleData, onCardClick, onFeedback, onSave, savedItems = [] }) {
  if (!bundleData || !bundleData.experience_bundle) return null;

  const { source_item, experience_bundle } = bundleData;
  const items = Object.entries(experience_bundle).map(([type, data]) => ({
    ...data,
    type,
  }));

  // Ensure we display in a specific order: movie -> game -> book -> song
  const order = ['movie', 'game', 'book', 'song'];
  items.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  return (
    <ContentRow
      title={`Complete the Universe: ${source_item?.title || 'Your Pick'}`}
      subtitle="Dive deeper into similar themes across different mediums."
      items={items}
      onCardClick={onCardClick}
      onFeedback={onFeedback}
      onSave={onSave}
      savedItems={savedItems}
    />
  );
}
