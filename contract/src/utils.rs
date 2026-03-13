use crate::bitmap::bitmaphelper::check_bit_status_u8;

pub fn get_active_ticks(bitmap: &[u8]) -> Vec<u32> {
    let mut active_ticks: Vec<u32> = vec![];

    for (index, i) in bitmap.iter().enumerate() {
        if *i != 0 {
            for x in 0..8 {
                if check_bit_status_u8(i, 7 - x) == 1 {
                    active_ticks.push((index * 8 + x as usize) as u32);
                }
            }
        }
    }
    active_ticks
}

#[cfg(test)]
mod tests {
    use crate::utils::get_active_ticks;
    #[test]
    pub fn get_active_ticks_test(){
        let ticks = get_active_ticks(&[1,0,0,1]);
        assert_eq!(ticks, [7, 31]);
    }   
}