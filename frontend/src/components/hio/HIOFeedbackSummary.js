import React from 'react';
import { Text } from 'react-native';
import { SectionCard, number, percentage } from './HIOUI';

export default function HIOFeedbackSummary({ feedback }) {
  return <SectionCard title="Citizen Feedback" icon="chatbubbles-outline">
    {!feedback?.available ? <Text>Feedback is unavailable.</Text> : !feedback.total ? <Text>No patient feedback for this appointment period.</Text> : <>
      <Text>Responses: {number(feedback.total)}</Text>
      <Text>Average rating: {feedback.averageRating}/5</Text>
      <Text>Positive ratings: {percentage(feedback.positivePercentage)}</Text>
    </>}
    <Text style={{ color: '#64748b', marginTop: 10, lineHeight: 19 }}>Grouped by appointment date. Positive = 4 or 5 out of 5. Patient names and comments are excluded.</Text>
  </SectionCard>;
}
