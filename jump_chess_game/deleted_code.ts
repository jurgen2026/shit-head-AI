let piece01 = null; let piece02 = null;
      try{
        piece01 = chess01.get(current_square);
      } catch(error) {
        piece01 = null;
      } finally{
        piece01 = null;
      }
      try{
        piece02 = chess02.get(current_square);
      } catch(error) {
        piece02 = null;
      } finally {
        piece02 = null;
      }