import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export async function fetchData({
  db,
  collectionName,
  queryCondition = null,  // Single query condition
  order = null,
  setData,
  setIsLoading,
  setError = null
}) {
  try {
    let q = collection(db, collectionName);

    // Apply the single query condition if provided
    if (queryCondition) {
      q = query(q, where(...queryCondition));
    }

    // Apply ordering if provided
    if (order) {
      q = query(q, orderBy(...order));
    }

    const querySnapshot = await getDocs(q);
    const dataList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setData(dataList);
  } catch (error) {
    console.error(`Error fetching data from ${collectionName}:`, error);
    if (setError) setError(`Failed to fetch data from ${collectionName}. Please try again.`);
  } 
}
