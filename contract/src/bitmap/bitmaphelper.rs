pub fn check_bit_status(bitarray: &[u8], tick: u64) -> u8 {
    let trail = tick % 80000;
    let index = trail / 8;
    let position = 7 - (trail % 8);
    let bits = bitarray[index as usize];
    println!("check status : {}, {}, {}, {}", index, position, bits, bits >> position);
    (bits >> position) & 1
}

pub fn check_bit_status_u8(bits: &u8, index: u8) -> u8 {
        (bits >> index) & 1
}

pub fn activate_bit(bitarray: &mut [u8], tick: u64) -> &mut [u8] {
    let status = check_bit_status(bitarray, tick);
    if status == 0 {
        let trail = tick % 80000;
        let index = trail / 8;
        let position = 7 - (trail % 8);
        let bits = &mut bitarray[index as usize];

        *bits |= 1 << position;
    }
    bitarray
}

pub fn deactivate_bit(bitarray: &mut [u8], tick: u64) -> &mut [u8] {
    let status = check_bit_status(bitarray, tick);
    if status == 1 {
        let trail = tick % 80000;
        let index = trail / 8;
        let position = 7 - (trail % 8);
        let bits = &mut bitarray[index as usize];

        *bits &= !(1 << position);
    }
    bitarray
}
pub fn get_bitarray_index(tick:u32) -> u32 {
    tick / 80000
}
pub fn get_tail(tick: u32) -> u32 {
    tick % 80000
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_activate_bit(){
        assert_eq!([0, 74], activate_bit(&mut [0 as u8, 10 as u8], 9))
    }
    #[test]
    fn test_deactivate_bit(){
        assert_eq!([0, 10], deactivate_bit(&mut [0, 74], 9))
    }
    #[test]
    fn test_check_bit_status() {
        let result =check_bit_status(&[3 as u8], 7); 
        assert_eq!(1, result)
    }
}
